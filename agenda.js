document.addEventListener('DOMContentLoaded', () => {
    let currentDate = new Date();
    let selectedDate = new Date();
    let tasks = {};
    let notes = [];

    // Elementos do DOM
    const calendar = document.getElementById('calendar');
    const currentMonthElement = document.getElementById('currentMonth');
    const prevMonthButton = document.getElementById('prevMonth');
    const nextMonthButton = document.getElementById('nextMonth');
    const taskInput = document.getElementById('taskInput');
    const taskPriority = document.getElementById('taskPriority');
    const addTaskButton = document.getElementById('addTask');
    const tasksList = document.getElementById('tasksList');
    const noteInput = document.getElementById('noteInput');
    const addNoteButton = document.getElementById('addNote');
    const notesList = document.getElementById('notesList');

    // Verificar autenticação
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
    }

    // Funções do Calendário
    function updateCalendar() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        // Atualiza o título do mês
        const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                          'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        currentMonthElement.textContent = `${monthNames[month]} ${year}`;
        
        // Limpa o calendário
        calendar.innerHTML = '';
        
        // Primeiro dia do mês
        const firstDay = new Date(year, month, 1);
        // Último dia do mês
        const lastDay = new Date(year, month + 1, 0);
        // Dia da semana do primeiro dia (0-6)
        const firstDayIndex = firstDay.getDay();
        
        // Dias do mês anterior
        const prevLastDay = new Date(year, month, 0).getDate();
        for (let i = firstDayIndex - 1; i >= 0; i--) {
            const dayElement = document.createElement('div');
            dayElement.textContent = prevLastDay - i;
            dayElement.classList.add('other-month');
            calendar.appendChild(dayElement);
        }
        
        // Dias do mês atual
        for (let i = 1; i <= lastDay.getDate(); i++) {
            const dayElement = document.createElement('div');
            dayElement.textContent = i;
            
            // Verifica se é hoje
            const today = new Date();
            if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                dayElement.classList.add('today');
            }
            
            // Verifica se é o dia selecionado
            if (i === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear()) {
                dayElement.classList.add('selected');
            }
            
            // Verifica se há tarefas neste dia
            const dateKey = new Date(year, month, i).toISOString().split('T')[0];
            if (tasks[dateKey] && tasks[dateKey].length > 0) {
                dayElement.classList.add('has-tasks');
                
                // Verifica a prioridade mais alta das tarefas
                const highestPriority = tasks[dateKey].reduce((highest, task) => {
                    const priorities = {
                        'muito-importante': 3,
                        'importante': 2,
                        'tranquila': 1
                    };
                    return priorities[task.priority] > priorities[highest] ? task.priority : highest;
                }, 'tranquila');
                
                dayElement.classList.add(highestPriority);
            }
            
            // Adiciona evento de clique
            dayElement.addEventListener('click', () => {
                selectedDate = new Date(year, month, i);
                updateCalendar();
                updateTasksList();
            });
            
            calendar.appendChild(dayElement);
        }
        
        // Dias do próximo mês
        const remainingDays = 42 - (firstDayIndex + lastDay.getDate());
        for (let i = 1; i <= remainingDays; i++) {
            const dayElement = document.createElement('div');
            dayElement.textContent = i;
            dayElement.classList.add('other-month');
            calendar.appendChild(dayElement);
        }
    }

    // Funções das Tarefas
    async function loadTasks() {
        try {
            const response = await fetch('http://localhost:3000/api/tasks', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const tasksList = await response.json();
                tasks = {};
                
                tasksList.forEach(task => {
                    const dateKey = new Date(task.date).toISOString().split('T')[0];
                    if (!tasks[dateKey]) {
                        tasks[dateKey] = [];
                    }
                    tasks[dateKey].push(task);
                });
                
                updateCalendar();
                updateTasksList();
            }
        } catch (error) {
            console.error('Erro ao carregar tarefas:', error);
        }
    }

    async function addTask(text) {
        if (!text.trim()) return;
        
        try {
            const response = await fetch('http://localhost:3000/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    text: text,
                    date: selectedDate.toISOString(),
                    priority: taskPriority.value
                })
            });
            
            if (response.ok) {
                const task = await response.json();
                const dateKey = new Date(task.date).toISOString().split('T')[0];
                if (!tasks[dateKey]) {
                    tasks[dateKey] = [];
                }
                tasks[dateKey].push(task);
                
                taskInput.value = '';
                updateTasksList();
                updateCalendar();
            }
        } catch (error) {
            console.error('Erro ao adicionar tarefa:', error);
        }
    }

    async function updateTaskStatus(taskId, completed) {
        try {
            const response = await fetch(`http://localhost:3000/api/tasks/${taskId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ completed })
            });
            
            if (response.ok) {
                loadTasks();
            }
        } catch (error) {
            console.error('Erro ao atualizar tarefa:', error);
        }
    }

    async function deleteTask(taskId) {
        try {
            const response = await fetch(`http://localhost:3000/api/tasks/${taskId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                loadTasks();
            }
        } catch (error) {
            console.error('Erro ao deletar tarefa:', error);
        }
    }

    function updateTasksList() {
        const dateKey = selectedDate.toISOString().split('T')[0];
        tasksList.innerHTML = '';
        
        if (!tasks[dateKey]) {
            tasks[dateKey] = [];
        }
        
        tasks[dateKey].forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.className = `task-item ${task.priority} ${task.completed ? 'completed' : ''}`;
            
            taskElement.innerHTML = `
                <input type="checkbox" ${task.completed ? 'checked' : ''}>
                <span>${task.text}</span>
                <button class="delete-task">&times;</button>
            `;
            
            // Evento de checkbox
            const checkbox = taskElement.querySelector('input[type="checkbox"]');
            checkbox.addEventListener('change', () => {
                updateTaskStatus(task._id, checkbox.checked);
            });
            
            // Evento de deletar
            const deleteButton = taskElement.querySelector('.delete-task');
            deleteButton.addEventListener('click', () => {
                deleteTask(task._id);
            });
            
            tasksList.appendChild(taskElement);
        });
    }

    // Funções das Anotações
    async function loadNotes() {
        try {
            const response = await fetch('http://localhost:3000/api/notes', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                notes = await response.json();
                updateNotesList();
            }
        } catch (error) {
            console.error('Erro ao carregar anotações:', error);
        }
    }

    async function addNote(text) {
        if (!text.trim()) return;
        
        try {
            const response = await fetch('http://localhost:3000/api/notes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ text })
            });
            
            if (response.ok) {
                const note = await response.json();
                notes.unshift(note);
                noteInput.value = '';
                updateNotesList();
            }
        } catch (error) {
            console.error('Erro ao adicionar anotação:', error);
        }
    }

    async function deleteNote(noteId) {
        try {
            const response = await fetch(`http://localhost:3000/api/notes/${noteId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                notes = notes.filter(note => note._id !== noteId);
                updateNotesList();
            }
        } catch (error) {
            console.error('Erro ao deletar anotação:', error);
        }
    }

    function updateNotesList() {
        notesList.innerHTML = '';
        
        notes.forEach(note => {
            const noteElement = document.createElement('div');
            noteElement.className = 'note-item';
            
            const date = new Date(note.createdAt);
            const formattedDate = date.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            noteElement.innerHTML = `
                <div class="note-content">
                    <div class="note-text">${note.text}</div>
                    <div class="note-date">${formattedDate}</div>
                </div>
                <button class="delete-note">&times;</button>
            `;
            
            // Evento de deletar
            const deleteButton = noteElement.querySelector('.delete-note');
            deleteButton.addEventListener('click', () => {
                deleteNote(note._id);
            });
            
            notesList.appendChild(noteElement);
        });
    }

    // Event Listeners
    prevMonthButton.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        updateCalendar();
    });

    nextMonthButton.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        updateCalendar();
    });

    addTaskButton.addEventListener('click', () => {
        addTask(taskInput.value);
    });

    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask(taskInput.value);
        }
    });

    addNoteButton.addEventListener('click', () => {
        addNote(noteInput.value);
    });

    noteInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addNote(noteInput.value);
        }
    });

    // Inicialização
    loadTasks();
    loadNotes();
    updateCalendar();
    updateTasksList();
    updateNotesList();
}); 