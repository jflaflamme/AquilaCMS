/*
 * Product    : AQUILA-CMS
 * Author     : Nextsourcia - contact@aquila-cms.com
 * Copyright  : 2021 © Nextsourcia - All rights reserved.
 * License    : Open Software License (OSL 3.0) - https://opensource.org/licenses/OSL-3.0
 * Disclaimer : Do not edit or add to this file if you wish to upgrade AQUILA CMS to newer versions in the future.
 */

const path           = require('path');
const {fork}         = require('child_process');
const fs             = require('../utils/fsp');
const packageManager = require('../utils/packageManager');
const jobServices    = require('../services/job');
const adminServices  = require('../services/admin');

const execScript = async (scriptPath) => {
    try {
        await Promise((resolve, reject) => {
            const res = fork(scriptPath);
            res.on('message', (message) => {
                resolve(message);
            });
            res.on('error', (err) => {
                if (err) reject(err);
            });
            res.send('process', (err) => {
                if (err) reject(err);
            });
        });
    } catch (err) {
        return false;
    }
    return true;
};

module.exports = (installRouter) => {
    installRouter.get('/', async (req, res, next) => {
        try {
            const wkhtmlInstalled = await execScript(path.resolve(global.appRoot, 'scripts/wkhtmltopdf.js'));
            const sharpInstalled  = await execScript(path.resolve(global.appRoot, 'scripts/sharp.js'));
            const html            = (await fs.readFile(path.join(global.appRoot, '/installer/install.html'))).toString()
                .replace('{{adminPrefix}}', `admin_${Math.random().toString(36).substr(2, 4)}`)
                .replace('{{aquilaCMSVersion}}', JSON.parse(await fs.readFile(path.resolve(global.appRoot, './package.json'))).version)
                .replace('{{wkhtmltopdf}}', wkhtmlInstalled)
                .replace('{{sharp}}', sharpInstalled);
            res.send(html, {}, (err) => {
                if (err) console.error(err);
            });
        } catch (err) {
            console.error(err);
            next(err);
        }
    });

    installRouter.post('/config', async (req, res) => {
        try {
            await require('../installer/install').firstLaunch(req, true);
            jobServices.initAgendaDB();
            await require('../utils/database').initDBValues();
            adminServices.welcome();
            const result = await packageManager.restart();
            res.send(result);
        } catch (err) {
            console.error(err);
            res.status(500).send(`Error : ${JSON.stringify(err)}`);

            // Recréation du env.json 'vide'
            await fs.unlink('./config/env.json');
            await require('../utils/server').getOrCreateEnvFile();
        }
    });

    installRouter.post('/recover', async (req, res) => {
        try {
            await require('../installer/install').firstLaunch(req, false);
            jobServices.initAgendaDB();
            adminServices.welcome();
            const result = await packageManager.restart();
            res.send(result);
        } catch (err) {
            console.error(err);
            res.status(500).send(`Error : ${JSON.stringify(err)}`);
        }
    });

    installRouter.post('/testdb', async (req, res) => {
        try {
            const result = await require('../installer/install').testdb(req);
            res.send(result);
        } catch (err) {
            console.error('Error : Cannot connect to database', err);
            res.status(500).send('Error : Cannot connect to database');
        }
    });
};
