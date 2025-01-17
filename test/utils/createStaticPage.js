const faker     = require('faker');
const {Statics} = require('../../orm/models');

const createStaticPage = (params = {code: null, content: null, title: null}) => {
    const {code, content, title} = params;
    const staticPage             = new Statics();
    staticPage.type              = 'page';
    staticPage.group             = null;
    staticPage.code              = code || faker.lorem.slug();
    staticPage.translation       = {
        fr : {
            variables : [],
            html      : '',
            content   : content || faker.lorem.text(),
            title     : title || faker.lorem.sentence()
        }
    };
    return staticPage.save();
};

const deleteAllStaticPage = async () => {
    await Statics.deleteMany({});
};

module.exports = {
    createStaticPage,
    deleteAllStaticPage
};