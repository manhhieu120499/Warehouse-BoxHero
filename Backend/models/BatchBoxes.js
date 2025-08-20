module.exports = (sequelize, Sequelize) => {
    const BatchBox = sequelize.define(
        'BatchBox',
        {
            batchID: {
                type: Sequelize.STRING,
                primaryKey: true,
            },
            boxID: {
                type: Sequelize.STRING,
                primaryKey: true,
            },
        },
        {
            tableName: 'batch_boxes',
            timestamps: true,
        },
    );

    return BatchBox;
};
