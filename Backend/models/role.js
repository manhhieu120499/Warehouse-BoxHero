module.exports = (sequelize, Sequelize) => {
    const Role = sequelize.define(
        'Role',
        {
            roleId: {
                type: Sequelize.STRING,
                primaryKey: true,
            },
            roleName: {
                type: Sequelize.STRING,
                allowNull: false,
            },
        },
        {
            tableName: 'roles',
            timestamps: false,
        },
    );

    Role.associate = (models) => {
        Role.belongsToMany(models.Account, {
            through: 'AccountRoles',
            foreignKey: 'roleId',
            otherKey: 'accountID',
        });
    };

    return Role;
};
