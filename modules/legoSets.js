require("dotenv").config();
const Sequelize = require("sequelize");

let sequelize = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "postgres",
    port: 5432,
    dialectModule: require("pg"),
    dialectOptions: {
      ssl: { rejectUnauthorized: false },
    },
  }
);

const Theme = sequelize.define(
  "Theme",
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: Sequelize.STRING,
    },
  },
  { timestamps: false }
);

const Set = sequelize.define(
  "Set",
  {
    set_num: {
      type: Sequelize.STRING,
      primaryKey: true,
    },
    name: Sequelize.STRING,
    year: Sequelize.INTEGER,
    num_parts: Sequelize.INTEGER,
    theme_id: Sequelize.INTEGER,
    img_url: Sequelize.STRING,
  },
  { timestamps: false }
);

Set.belongsTo(Theme, { foreignKey: "theme_id" });

function initialize() {
  return sequelize.sync();
}

function getAllSets() {
  return Set.findAll({
    include: [Theme],
  });
}

function getSetByNum(setNum) {
  return Set.findOne({
    where: { set_num: setNum },
    include: [Theme],
  });
}

function getSetsByTheme(theme) {
  return Set.findAll({
    include: [
      {
        model: Theme,
        where: {
          name: {
            [Sequelize.Op.iLike]: `%${theme}%`,
          },
        },
      },
    ],
  });
}
function getAllThemes() {
  return Theme.findAll();
}

function addSet(setData) {
  return Set.create(setData);
}
function editSet(set_num, setData) {
  return Set.update(setData, {
    where: { set_num: set_num },
  });
}
function deleteSet(set_num) {
  return Set.destroy({
    where: { set_num: set_num },
  });
}

module.exports = {
  initialize,
  getAllSets,
  getSetByNum,
  getSetsByTheme,
  getAllThemes,
  addSet,
  editSet,
  deleteSet,
};
