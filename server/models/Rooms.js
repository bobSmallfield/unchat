module.exports = (sequelize, DataTypes) => {
    const Rooms = sequelize.define("Rooms", {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        active: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        dateDeactivated: {
            type: DataTypes.DATE,
            allowNull: true
        }
    })

    Rooms.associate = (models) => {
        Rooms.hasMany(models.Messages, {
            onDelete: "cascade"
        })
    }

    return Rooms;
}