// Floor.js
module.exports = (sequelize, DataTypes) => {
    const Floor = sequelize.define('Floor', {
        floorID: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        floorName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        shelfID: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
        {
            tableName: 'floors',
            timestamps: true,
        } 
    );

    Floor.associate = (models) => {
        Floor.belongsTo(models.Shelf, { foreignKey: 'shelfID' });
        Floor.hasMany(models.Box, { foreignKey: 'floorID' });
    };

    return Floor;
};
