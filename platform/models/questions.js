const delta_to_html = require('quill-delta-to-html');
const delta_to_plaintext = require('quill-delta-to-plaintext');
const request = require('request-promise');

module.exports = (sequelize, DataTypes) => {
    return sequelize
        .define('questions', {
            question_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            user_id: DataTypes.INTEGER,
            title: DataTypes.STRING,
            question: DataTypes.TEXT('medium'),
            score: DataTypes.INTEGER,
            views: DataTypes.INTEGER,
            comments: DataTypes.INTEGER,
            created_at: DataTypes.DATE
        },
        {
            freezeTableName: true,

            hooks: {
                beforeCreate(instance) {
                    instance.created_at = util.now();
                },

                afterCreate(instance) {
                    db.questions
                        .find_one({
                            where: {
                                question_id: instance.question_id
                            },
                            include: [
                                {
                                    model: db.users,
                                    as: 'user'
                                }
                            ]
                        })
                        .then(question => {
                            if (!question) return null;

                            discord
                                .api('post', '/channels/483979558249562112/messages', {
                                    embed: {
                                        title: 'Click here to view',
                                        type: 'rich',
                                        color: 0x2ecc71,
                                        url: constant.base_url + instance.url,
                                        author: {
                                            name: 'New Question: ' + instance.title
                                        },
                                        footer: {
                                            icon_url: constant.cdn_url + question.user.avatar_url,
                                            text: 'posted by ' + question.user.display_name
                                        }
                                    }
                                })
                                .catch(err => {});
                        });
                }
            },

            getterMethods: {
                url() {
                    return '/d' + this.question_id + '/' + util.slugify(this.title);
                },

                slug() {
                    return util.slugify(this.title)
                },

                time_ago() {
                    return util.time_ago(this.created_at);
                },

                question_html() {
                    try {
                        const json = JSON.parse(this.question);

                        const converter = new delta_to_html(json.ops, {});

                        return converter.convert();
                    } catch (e) {
                        return '';
                    }
                },

                description() {
                    try {
                        const json = JSON.parse(this.question);

                        return delta_to_plaintext(json.ops).slice(0, 250).trim();
                    } catch (e) {
                        return '';
                    }
                }
            }
        }
    );
};
