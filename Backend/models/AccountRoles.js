module.exports = (sequelize, Sequelize) => {
    const AccountRoles = sequelize.define(
        'AccountRoles',
        {
            accountID: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            roleID: {
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
