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
            quantity: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
        },
        {
            tableName: 'batch_boxes',
            timestamps: true,
        },
    );

    return BatchBox;
};
