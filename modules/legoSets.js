require("dotenv").config();
const Sequelize = require("sequelize");

// Initialize Sequelize with environment variables
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

// Define the Theme model
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

// Define the Set model
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

// Set association
Set.belongsTo(Theme, { foreignKey: "theme_id" });

// Function to initialize the database (without bulk data insertion)
function initialize() {
  return sequelize.sync();
}

// Function to get all sets with themes
function getAllSets() {
  return Set.findAll({
    include: [Theme],
  });
}

// Function to get a set by its number
function getSetByNum(setNum) {
  return Set.findOne({
    where: { set_num: setNum },
    include: [Theme],
  });
}

// Function to get sets by theme name
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

// Function to add a new set
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

// Export the functions
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
