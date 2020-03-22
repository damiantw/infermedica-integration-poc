require("dotenv").config();
const { diagnosis, triage } = require("./infermedica");
const inquirer = require("inquirer");

const askSex = async () => {
  const { sex } = await inquirer.prompt([
    {
      name: "sex",
      type: "list",
      message: "What is your sex?",
      choices: ["male", "female"],
    },
  ]);
  return sex;
};

const askAge = async () => {
  const { age } = await inquirer.prompt([
    {
      name: "age",
      type: "number",
      message: "What is your age?",
      validate: (age) => !isNaN(age) && age > 0 && age < 100,
    },
  ]);
  return age;
};

const askSingle = async ({ text, items }) => {
  const { value } = await inquirer.prompt([
    {
      name: "value",
      type: "list",
      message: text,
      choices: items[0].choices.map((c) => {
        return { name: c.label, value: c.id };
      }),
    },
  ]);
  return { id: items[0].id, choice_id: value };
};

const askGroupSingle = async ({ text, items }) => {
  const { value } = await inquirer.prompt([
    {
      name: "value",
      type: "list",
      message: text,
      choices: items.map((i) => {
        return { name: i.name, value: i.id };
      }),
    },
  ]);
  return { id: value, choice_id: "present" };
};

const askGroupMultiple = async ({ text, items }) => {
  const { checked } = await inquirer.prompt([
    {
      name: "checked",
      type: "checkbox",
      message: text,
      choices: items.map((i) => {
        return { name: i.name, value: i.id };
      }),
    },
  ]);
  return items.map((i) => {
    return {
      id: i.id,
      choice_id: checked.includes(i.id) ? "present" : "absent",
    };
  });
};

const main = async () => {
  const sex = await askSex();
  const age = await askAge();
  const evidence = [];

  let response = await diagnosis({ sex, age, evidence });

  while (!response.should_stop) {
    switch (response.question.type) {
      case "single":
        evidence.push(await askSingle(response.question));
        break;
      case "group_single":
        evidence.push(await askGroupSingle(response.question));
        break;
      case "group_multiple":
        const entries = await askGroupMultiple(response.question);
        entries.forEach((e) => evidence.push(e));
        break;
    }
    response = await diagnosis({ sex, age, evidence });
  }

  response = await triage({ sex, age, evidence });

  console.info(response.label);
  console.info(response.description);
  console.info("Serious observations:");
  response.serious.forEach((serious) => console.info(serious.common_name));
};

main();
