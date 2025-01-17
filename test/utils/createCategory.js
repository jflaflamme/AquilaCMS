const faker        = require('faker');
const {Categories} = require('../../orm/models');

const createCategory = (params = {id_parent: null, code: null, name: null, slug: null}) => {
    const {id_parent, code, name, slug} = params;
    const category                      = new Categories();
    category.code                       = code || faker.lorem.slug();
    category.id_parent                  = id_parent || null;
    category.translation                = {
        fr : {
            name : name || faker.lorem.slug(),
            slug : slug || faker.lorem.slug()
        }
    };
    return category.save();
};

const deleteAllCategories = async () => {
    await Categories.deleteMany({});
};

module.exports = {
    createCategory,
    deleteAllCategories
};