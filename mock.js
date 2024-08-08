import { fakerPT_BR as faker }from '@faker-js/faker';
import fs from "fs";
const data = Array(1000).fill(null).map(()=>({
  name: faker.person.firstName(),
  id: faker.string.uuid().split("-")[0],
  age: faker.helpers.rangeToNumber({ min: 1, max: 75 }),
  sex: faker.person.sex(),
}));

const jsonContent = JSON.stringify({people: data}, null, 2);
const path = "./db.json";

fs.writeFile(path, jsonContent, 'utf8', (err) => {
  if (err) {
    console.error('Error on save JSON:', err);
    return;
  }
  console.log('Json created.');
});
