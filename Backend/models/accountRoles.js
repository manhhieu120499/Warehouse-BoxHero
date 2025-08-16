module.exports = (sequelize, Sequelize) => {
    const AccountRoles = sequelize.define(
        'AccountRoles',
        {
            accountID: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            roleId: {
                type: Sequelize.STRING,
                allowNull: false,
            },
        },
        {
            tableName: 'account_roles',
            timestamps: false,
        },
    );

    return AccountRoles;
};
