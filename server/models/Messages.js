module.exports = (sequelize, DataTypes) => {
    const Messages = sequelize.define("Messages", {
        message: {
            type: DataTypes.TEXT('medium'),
            allowNull: false
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false
        }
    })

    return Messages;
}