import { API_BASE_URL } from "../../config/apiConfig.js";

document.addEventListener('DOMContentLoaded', () => {
  const darkModeToggle = document.getElementById('switch');
  
  // Verificar a preferência armazenada no localStorage
  const isDarkMode = localStorage.getItem('darkMode') === 'true';
  if (isDarkMode) {
    document.body.classList.add('dark-mode');
    darkModeToggle.checked = true;
  }

  // Ouvir a mudança do switch para alternar o tema
  darkModeToggle.addEventListener('change', () => {
    if (darkModeToggle.checked) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('darkMode', 'false');
    }
  });
});


const dropdownButton = document.querySelector('.dropdown-button');
const dropdownContent = document.getElementById('dropdown-content');

dropdownButton.addEventListener('click', () => {
  const isVisible = dropdownContent.style.display === 'block';
  dropdownContent.style.display = isVisible ? 'none' : 'block';
});

window.addEventListener('click', (event) => {
  if (!event.target.matches('.dropdown-button') && !dropdownContent.contains(event.target)) {
    dropdownContent.style.display = 'none';
  }
});

async function populateDropdown() {
  try {
    const response = await fetch(`${API_BASE_URL}/boards`);
    if (!response.ok) {
      if (response.status === 422) {
        const errorData = await response.json();
        showError(errorData.Errors[0]);
      } else {
        showError("Aconteceu um erro inesperado, tente novamente.");
      }
      return;
    }

    const boards = await response.json();
    console.log(boards);

    dropdownContent.innerHTML = '';

    boards.forEach((board) => {
      const listItem = document.createElement('li');
      listItem.innerHTML = `${board.Name}`;

      listItem.addEventListener('click', (event) => {
        event.preventDefault(); 
         
        getColumnsByBoardID(board.Id); 
        dropdownContent.style.display = 'none';  
      });

      dropdownContent.appendChild(listItem);
    });

  } catch (error) {
    showError("Erro ao conectar ao servidor.");
  }
}

async function getColumnsByBoardID(boardId) {
  try {
    const response = await fetch(`${API_BASE_URL}/ColumnByBoardId?BoardId=${boardId}`);
    if (!response.ok) {
      console.error("Erro ao buscar as colunas:", response.status);
      document.getElementById('columns-display').innerHTML = "Erro ao buscar colunas.";
      return;
    }
    const columns = await response.json();
    displayColumns(columns);

  } catch (error) {
    console.error("Erro ao conectar com a API:", error);
    document.getElementById('columns-display').innerHTML = "Erro ao conectar ao servidor.";
  }
}

 

async function getTasksByColumnId(columnId) {
  try {
    const response = await fetch(`https://personal-ga2xwx9j.outsystemscloud.com/TaskBoard_CS/rest/TaskBoard/TasksByColumnId?ColumnId=${columnId}`);
    if (!response.ok) {
      console.error("Erro ao buscar as tasks:", response.status);
      return;
    }
    const tasks = await response.json();
    displayTasks(columnId, tasks);
  } catch (error) {
    console.error("Erro ao conectar com a API de Tasks:", error);
  }
}

function displayTasks(columnId, tasks) {
  const columnElement = document.querySelector(`#column-${columnId}`);  // Acessa a coluna pela ID
  const tasksDisplay = columnElement.querySelector('.tasks-display'); // Encontra a área para exibir as tasks

  tasksDisplay.innerHTML = ''; // Limpa as tasks anteriores

  tasks.forEach(task => {
    const taskElement = document.createElement('div');
    taskElement.classList.add('task');
    taskElement.innerHTML = `<p>${task.Title}</p>`



    
    tasksDisplay.appendChild(taskElement);
  });
}
// Abrir o modal
document.getElementById('openModalButton').addEventListener('click', () => {
  document.getElementById('createColumnModal').classList.remove('hidden');
});

// Fechar o modal
document.getElementById('closeModalButton').addEventListener('click', () => {
  document.getElementById('createColumnModal').classList.add('hidden');
});

// Fechar o modal ao clicar fora do conteúdo
window.addEventListener('click', (event) => {
  const modal = document.getElementById('createColumnModal');
  if (event.target === modal) {
    modal.classList.add('hidden');
  }
});

function displayColumns(columns) {
  const columnsDisplay = document.getElementById('columns-display');
  columnsDisplay.innerHTML = '';  // Limpar colunas antigas

  columns.forEach(column => {
    const columnElement = document.createElement('div');
    columnElement.classList.add('column');
    columnElement.id = `column-${column.Id}`;  // ID único para cada coluna
    columnElement.innerHTML = ` 
     <button class="delete-column-btn">x</button>
      <h3>${column.Name}</h3>
    
      <div class="tasks-display">Tasks carregando...</div>
    `;

    const deleteButton = columnElement.querySelector('.delete-column-btn');
    deleteButton.addEventListener('click', async () => {
      const confirmed = confirm(`Deseja realmente apagar a coluna "${column.Name}"?`);
      if (confirmed) {
        try {
          const response = await fetch(`https://personal-ga2xwx9j.outsystemscloud.com/TaskBoard_CS/rest/TaskBoard/Column?ColumnId=${column.Id}`, {
            method: 'DELETE',
          });

          if (response.ok) {
            alert('Coluna apagada com sucesso!');
            columnElement.remove(); // Remove a coluna da exibição
          } else {
            alert('Erro ao apagar a coluna.');
          }
        } catch (error) {
          console.error('Erro ao conectar com a API:', error);
          alert('Erro ao conectar ao servidor.'); }} })

    columnsDisplay.appendChild(columnElement);

    




    // Chama a função para buscar as tasks para cada coluna
    getTasksByColumnId(column.Id);

    const createColumnButton = document.getElementById('openModalButton');
  createColumnButton.classList.remove('hidden');
  });

  
}

 

function showError(message) {
  console.error(message);
}

document.getElementById('LogOut').addEventListener('click', () => {
  localStorage.removeItem('user');
  window.location.href = 'index.html'; 
});

function createColumn(columnData) {
            
  const endpoint = `${API_BASE_URL}/Column`;

  fetch(endpoint, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify(columnData),
  })
  .then((response) => {
      if (!response.ok) {
          return response.json().then((errorData) => {
              throw errorData;
          });
      }
      return response.json();
  })
  .then((data) => {
      console.log('Coluna criada com sucesso:', data);
      document.getElementById('responseMessage').textContent = 'Coluna criada com sucesso!';
      document.getElementById('responseMessage').classList.remove('error');
      document.getElementById('responseMessage').classList.add('success');
  })
  .catch((errorData) => {
      console.error('Erro ao criar coluna:', errorData);
      // Exibir a mensagem de erro
      if (errorData.Errors && errorData.Errors.length > 0) {
          document.getElementById('responseMessage').textContent = errorData.Errors.join(', ');
      } else {
          document.getElementById('responseMessage').textContent = 'Erro ao criar coluna.';
      }
      document.getElementById('responseMessage').classList.remove('success');
      document.getElementById('responseMessage').classList.add('error');
  });
}

document.getElementById('submit').addEventListener('click', function (event) {
  event.preventDefault();

  const boardId = document.getElementById('boardId').value;
  const name = document.getElementById('name').value;
  const position = document.getElementById('position').value;
   

  const columnData = {
      BoardId: boardId,
      Name: name,
      Position: position,
      IsActive: true
  };

  createColumn(columnData);
});




document.addEventListener('DOMContentLoaded', () => {
  populateDropdown();
});
