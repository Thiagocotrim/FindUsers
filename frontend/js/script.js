const MINIMUM_ACCEPTED_CHARACTERS = 1;

let allUsers = [];
let filteredUsers = [];

const form = document.querySelector('form');
const inputSearch = document.querySelector('#inputSearch');
const buttonSearch = document.querySelector('#buttonSearch');
const divUsers = document.querySelector('#divUsers');
const divStatistics = document.querySelector('#divStatistics');
const enablebuttonClass = 'bg-green-500';

async function start(){
 await readDataFromBackend();
 enableControls();
 enableEvents();

  console.log(allUsers);
}

async function readDataFromBackend(){
  const resource = await fetch('http://localhost:3001/users');
  const json = await resource.json(); 

  allUsers = json.map(({gender,name, login, dob, picture}) => {
    const fullName = `${name.first} ${name.last}`;
    const nameSearch = fullName.toLowerCase()

    return{
      id: login.uuid,
      name: fullName,
      nameSearch,
      age: dob.age,
      picture: picture.medium,
      gender,
    };
  });

  filteredUsers = [...allUsers];
}

function enableControls(){
  inputSearch.disabled = false;
  inputSearch.focus();
}

function enableEvents(){
  inputSearch.addEventListener('input', ({currentTarget}) => {
    const shouldEnable = currentTarget.value.length >= MINIMUM_ACCEPTED_CHARACTERS;

    buttonSearch.disabled = !shouldEnable;

    shouldEnable
      ? buttonSearch.classList.add(enablebuttonClass)
      : buttonSearch.classList.remove(enablebuttonClass);

  });

  form.addEventListener('submit' , event => {
    event.preventDefault();

    const searchTerm = inputSearch.value;
    doFilterUsers(searchTerm);
  });
}

function doFilterUsers(searchTerm){
  const lowerCaseSearchTerm = searchTerm.toLowerCase();

  filteredUsers = allUsers
    .filter(user => user.nameSearch.includes(lowerCaseSearchTerm))
    .sort((a ,b) => a.name.localeCompare(b.name));

  render();
}

function render(){
  renderStatistics();
  renderUsers();
}

function renderStatistics(){
  if (doFilterUsers.length === 0){
    divStatistics.textContent = "Nada a ser exibido.";
  }

  const maleUsers = filteredUsers.filter(({gender}) => gender === 'male').length;
  const femaleUsers = filteredUsers.filter(({gender}) => gender === 'female').length;

  const sumAges = filteredUsers.reduce((accumulator, {age}) => accumulator + age, 0);

  const averageAges = (sumAges / filteredUsers.length).toFixed(2).replace('.', ',');

  divStatistics.innerHTML = `
    <h2 class="margin-auto text-center text-xl font-semibold mb-2">
      Estatísticas
    </h2>

    <ul>
      <li>Sexo masculino: <strong>${maleUsers}</strong></li>
      <li>Sexo feminino: <strong>${femaleUsers}</strong></li>
      <li>Soma das idades: <strong>${sumAges}</strong></li>
      <li>Media das idades: <strong>${averageAges}</strong></li>
    </ul>
  `;
}

function renderUsers(){
  if (doFilterUsers.length === 0){
    divUsers.textContent = "Nenhum usuário encontrado com esses critérios.";
  }

  divUsers.innerHTML = `
    <h2 class="margin-auto text-center text-xl font-semibold mb-2">
      ${filteredUsers.length} usuário(s) encontrado(s)
    </h2>

    <ul>
      ${filteredUsers.map(({name, age, picture}) => {
        return `
          <li class="flex flex-row items-center justify-start mb-2 space-x-4">
            <img class="rounded-full" src="${picture}" alt="${name}" title="${name}" />
            <span>${name}, ${age} anos</span>
          </li>
        `
      }).join('')}
    </ul>
  `
}

start();