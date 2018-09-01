const crypto = require('crypto');

module.exports = (sequelize, DataTypes) => {
    return sequelize
        .define('users', {
            user_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            is_staff: DataTypes.INTEGER,
            username: DataTypes.STRING,
            email: DataTypes.STRING,
            password: DataTypes.STRING,
            discord_api: DataTypes.STRING,
            avatar_url: DataTypes.STRING,
            score: DataTypes.INTEGER,
            created_at: DataTypes.DATE
        },
        {
            freezeTableName: true,

            hooks: {
                beforeCreate(instance) {
                    instance.created_at = util.now();

                    if (instance.password)
                        instance.password = crypto
                            .createHash('sha1')
                            .update(instance.password)
                            .digest('hex');
                },

                beforeUpdate(instance) {
                    if (instance.changed('password'))
                        instance.password = crypto
                            .createHash('sha1')
                            .update(instance.password)
                            .digest('hex');
                }
            }
        }
    );
};