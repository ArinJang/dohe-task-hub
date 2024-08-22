document.addEventListener('DOMContentLoaded', function() {
    const categoryList = document.getElementById('category-list');
    const weekDisplay = document.getElementById('week-display');
    const navigationBar = document.getElementById('navigation-bar');
    const listDetail = document.getElementById('list-detail');
    const taskInput = document.getElementById('taskInput');
//    const workInput = document.getElementById('workInput');
    const workInput = document.querySelector('.work-input');
    const addTaskButton = document.getElementById('addTaskButton');
    const taskList = document.getElementById('taskList');
    const dayList = document.getElementById('dayList');
    const daysList = document.querySelector('.days-list');
    const taskDetail = document.getElementById('taskDetail');
    const taskForm = document.getElementById('taskForm');
    var refresh = false;
    var detailID;
    var idToShowDetail;
    var currentId;
    const successModal = document.getElementById('successModal');
    const closeModal = document.querySelector('#successModal .close');
    let categoriesList = []; // 전역 변수 선언

    const addDateButton = document.getElementById('addDateButton');
    const doDatesContainer = document.getElementById('doDatesContainer');
    // Delete Confirmation Modal Elements
    const deleteConfirmationModal = document.getElementById('deleteConfirmationModal');
    const confirmDeleteButton = document.getElementById('confirmDeleteButton');
    const cancelDeleteButton = document.getElementById('cancelDeleteButton');
    const saveChangesButton = document.getElementById('saveChangesButton');
    const deleteConfirmationButton = document.getElementById('deleteConfirmationButton');
    let daysListVisible = true; // Initial state of daysList
//    let selectedNav = null;
    let selectedDate = null;
    let selectedSide = 'week';
        const daysOfWeek = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
//    var currentIdLocal = sessionStorage.getItem('detailID');
//    var currentSide = sessionStorage.getItem('side');
//    var reloadNav = sessionStorage.getItem('nav');
//    var baseDate = sessionStorage.getItem('baseDate');
    var selectedNav = null;
    var selectedDay = null;
    const validationModal = document.getElementById('validationModal');
//    sessionStorage.setItem('nav','');
    console.log("TOP++ sessionStorage.getItem('nav')?! ",sessionStorage.getItem('nav'));

    var taskDetailContent = document.getElementById('taskDetailContent');
    var detailElements = taskDetailContent.querySelectorAll('input, select, textarea');

    // Define your initial tasks array (this should be replaced with your actual data fetching logic)
    let tasks = [
        { task_id: 1, task_content: 'Task 1', due_date: '2024-08-12', day_of_week: 'Monday', status: 'In Progress' },
        { task_id: 2, task_content: 'Task 2', due_date: '2024-08-13', day_of_week: 'Tuesday', status: 'Completed' },
        // ... more tasks
    ];

    // Organize tasks by day_of_week
    var tasksByDay = tasks.reduce((acc, task) => {
        const day = task.day_of_week;
        if (!acc[day]) {
            acc[day] = [];
        }
        acc[day].push(task);
        return acc;
    }, {});

    let currentMonth = new Date().getMonth(); // 0-based index (0 = January)
    let currentYear = new Date().getFullYear();
    let currentWeek = getWeekOfMonth(new Date());

    const categories = {
        week: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
        work: ['All', 'Personal', 'Dohe'],
        delegation: ['Task A', 'Task B', 'Task C'],
        completed: ['Task 1', 'Task 2', 'Task 3']
    };

    window.addEventListener('beforeunload', function() {
        sessionStorage.clear(); // sessionStorage 데이터 삭제
    });

    function getWeekOfMonth(date) {
        const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const firstMonday = firstDayOfMonth.getDate() + (1 - firstDayOfMonth.getDay() + 7) % 7;
        const daysFromFirstMonday = date.getDate() - firstMonday;
        return Math.max(Math.ceil((daysFromFirstMonday + 1) / 7), 1); // Week number, ensure it starts at 1
    }

    function getStartDateOfWeek(year, month, week) {
        const firstDayOfMonth = new Date(year, month, 1);
        const firstMonday = firstDayOfMonth.getDate() + (1 - firstDayOfMonth.getDay() + 7) % 7;
        const startDate = new Date(year, month, firstMonday + (week - 1) * 7);
        return startDate;
    }

    function getFormattedWeekRange(startDate) {
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6); // One week later
        const startMonthDay = `${startDate.getMonth() + 1}/${startDate.getDate()}`;
        const endMonthDay = `${endDate.getMonth() + 1}/${endDate.getDate()}`;
        return `${startMonthDay}~${endMonthDay}`;
    }

    function updateWeekDisplay() {
        if(sessionStorage.getItem('today') === 'true') {
            currentMonth = new Date().getMonth(); // 0-based index (0 = January)
            currentYear = new Date().getFullYear();
            currentWeek = getWeekOfMonth(new Date());
        }
        const startDate = getStartDateOfWeek(currentYear, currentMonth, currentWeek);
        sessionStorage.setItem('baseDate', startDate);
        sessionStorage.setItem('nav', '');
        selectedDate = null;
        weekDisplay.textContent = getFormattedWeekRange(startDate);
    }

    // NavigationBar 업데이트 함수
    function updateWeekDates() {
    console.log('sessionStorage.getItem(today)',sessionStorage.getItem('today'));
        navigationBar.innerHTML = '';
        if(sessionStorage.getItem('today') === 'true'   ) {
            currentMonth = new Date().getMonth(); // 0-based index (0 = January)
            currentYear = new Date().getFullYear();
            currentWeek = getWeekOfMonth(new Date());
        }
        const startDate = getStartDateOfWeek(currentYear, currentMonth, currentWeek);

        const dates = Array.from({ length: 7 }, (_, i) => {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            return date;
        });

        dates.forEach(date => {
            const dayIndex = (date.getDay() + 6) % 7; // Adjusting to MON = 0, ..., SUN = 6
            const dayName = categories.week[dayIndex];
            const dayDateContainer = document.createElement('div');
            dayDateContainer.className = 'nav-item'; // Use same class for styling
            dayDateContainer.dataset.date = formatDate(date);
            dayDateContainer.dataset.day = dayName;

            const dayElement = document.createElement('div');
            dayElement.textContent = dayName;

            const dateElement = document.createElement('div');
            dateElement.textContent = date.getDate();

            dayDateContainer.appendChild(dayElement);
            dayDateContainer.appendChild(dateElement);

            dayDateContainer.addEventListener('click', function() {
            });
            navigationBar.appendChild(dayDateContainer);
        });
    }

    function createNavItem(catName, categoryOrDelegation) {
        const navItem = document.createElement('div');
        navItem.textContent = catName;
        navItem.className = 'nav-item';

        const editBtn = document.createElement('div');
        editBtn.textContent = '✎';
        editBtn.className = 'edit-btn';
        editBtn.addEventListener('click', function(event) {
            event.stopPropagation();
            // Determine the message based on the category
            let promptMessage;
            if (categoryOrDelegation === 'work') {
                promptMessage = 'Edit category:';
            } else if (categoryOrDelegation === 'delegation') {
                promptMessage = 'Edit a person to delegate:';
            } else {
                promptMessage = `Edit ${category} name:`;
            }
            const newName = prompt(promptMessage, catName);
            if (newName) {
                categories[categoryOrDelegation][categories[categoryOrDelegation].indexOf(catName)] = newName;
                updateNavigationBar(categoryOrDelegation);
            }
        });

        const deleteBtn = document.createElement('div');
        deleteBtn.textContent = '✖';
        deleteBtn.className = 'delete-btn';
        deleteBtn.addEventListener('click', function(event) {
            event.stopPropagation();
            if (confirm(`Delete ${catName}?`)) {
                categories[categoryOrDelegation] = categories[categoryOrDelegation].filter(i => i !== catName);
                updateNavigationBar(categoryOrDelegation);
            }
        });

        navItem.appendChild(editBtn);
        navItem.appendChild(deleteBtn);

        return navItem;
    }

    function updateNavigationBar(category) {
        navigationBar.innerHTML = '';
        //listDetail.innerHTML = '';

        if (category === 'work') {
            workInput.style.display = 'flex';
        } else {
            workInput.style.display = 'none';
        }
        if (category === 'week') {
            updateWeekDates();
        } else if (category === 'work') {
            const allButton = document.createElement('div');
            allButton.textContent = 'All';
            allButton.className = 'nav-item';
            allButton.addEventListener('click', function() {
                // Handle "All" button click
            });
            navigationBar.appendChild(allButton);

            const items = categoriesList;
            items.forEach(item => {
                const navItem = createNavItem(item.category_name, category);
                navItem.addEventListener('click', function() {
                    setActiveNavItem(navItem);
                    updateContent(category, item.category_name);
                });
                navigationBar.appendChild(navItem);
            });

            const addButton = document.createElement('div');
            addButton.textContent = '+';
            addButton.className = 'nav-item';
            addButton.addEventListener('click', function() {
                let promptMessage;
                if (category === 'work') {
                    promptMessage = 'Enter a new category:';
                } else if (category === 'delegation') {
                    promptMessage = 'Enter a new person to delegate:';
                } else {
                    promptMessage = `Enter a new ${category} name:`;
                }
                const newItemName = prompt(promptMessage);

                if (newItemName) {
                    // dbdbdbdb
                    // categories[category].push(newItemName);
                    // updateNavigationBar(category);
                }
            });
            navigationBar.appendChild(addButton);
        } else {
            const items = categoriesList;
            items.forEach(item => {
                const navItem = createNavItem(item, category);
                navItem.addEventListener('click', function() {
                    setActiveNavItem(navItem);
                    updateContent(category, item);
                });
                navigationBar.appendChild(navItem);
            });
        }
        //listDetail.innerHTML = `<p>Content for ${category.toUpperCase()} category</p>`;
    }

    function setCategory(category) {
        document.querySelectorAll('.category-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`.category-item[data-category="${category}"]`).classList.add('active');
        updateNavigationBar(category);
        if (category === 'week') {
            updateWeekDisplay();
        }
    }

    function setActiveNavItem(activeItem) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        activeItem.classList.add('active');
    }

    function clickCategory(selectedSide) {
        switch (selectedSide) {
            case 'week':
            console.log('clickCategory week~');
                fetchNotAssignedTasks();
                fetchTasksByDateRange(); // Call this first
                renderDayTitlesList(); // Ensure days list is rendered first
                showForm(); // 폼을 보이게 함
                break;
            case 'delegation':
                hideForm(); // 폼을 숨김
                fetchStatus(5); // Fetch status 5
                break;
            case 'onhold':
                hideForm(); // 폼을 숨김
                fetchStatus(4); // Fetch status 4
                break;
            default:
                showForm(); // 기본적으로 폼을 보이게 함
                break;
        }
    }

    categoryList.addEventListener('click', function(event) {
        selectedSide = event.target.getAttribute('data-category');
        selectedDate = null;
        console.log('selectedSide?? ',selectedSide);
        if (event.target.classList.contains('category-item')) {
            setCategory(selectedSide);
        }
        clickCategory(selectedSide);
    });
    // 폼을 보이게 하는 함수
    function showForm() {
        taskForm.style.display = 'block';
        daysList.style.display = 'block';
    }

    // 폼을 숨기는 함수
    function hideForm() {
        taskForm.style.display = 'none';
        daysList.style.display = 'none';
    }

    document.getElementById('prev-week').addEventListener('click', function() {
        currentWeek--;
        if (currentWeek < 1) {
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            currentWeek = getWeekOfMonth(new Date(currentYear, currentMonth + 1, 0));
        }
        updateWeekDisplay();
        if (document.querySelector('.category-item.active').getAttribute('data-category') === 'week') {
            updateWeekDates();
        }
//        sessionStorage.setItem('baseDate', baseDate);
        fetchTasksByDateRange(); // Call this first
        renderDayTitlesList(); // Ensure days list is rendered first
    });

    document.getElementById('next-week').addEventListener('click', function() {
        currentWeek++;
        const lastWeekOfMonth = Math.ceil(new Date(currentYear, currentMonth + 1, 0).getDate() / 7);
        if (currentWeek > lastWeekOfMonth) {
            currentWeek = 1;
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
        }
        updateWeekDisplay();
        if (document.querySelector('.category-item.active').getAttribute('data-category') === 'week') {
            updateWeekDates();
        }
//        sessionStorage.setItem('baseDate', baseDate);
        fetchTasksByDateRange(); // Call this first
        renderDayTitlesList(); // Ensure days list is rendered first
    });

    function initialize() {
        fetchTasksByDateRange(); // Call this first
//        renderDayTitlesList(); // Ensure days list is rendered first
        const today = new Date();
        currentMonth = today.getMonth();
        currentYear = today.getFullYear();
        currentWeek = getWeekOfMonth(today);
        setCategory('week'); // Default category
        populateCategories(); // Call the function to populate categories on page load
        navigationBar.addEventListener('click', handleNavItemClick); // 이벤트 리스너 등록

        if(sessionStorage.getItem('nav') && sessionStorage.getItem('nav').trim() !== '') triggerNavItemClick(sessionStorage.getItem('nav'));

    }

    initialize(); // Call initialize to set up the UI

// Variables to store the original values of the inputs
let originalValues = {
    taskName: '',
    categoryName: '',
    workName: '',
    dueDate: '',
    taskMemo: '',
    taskStatus: ''
};

function showTaskDetail(task) {
    if (task && typeof task === 'object') {
        // Update the values of the form fields with the task details
        const taskNameInput = document.getElementById('taskName');
        const categoryNameInput = document.getElementById('categoryName');
        const workNameInput = document.getElementById('workName');
        const dueDateInput = document.getElementById('dueDate');
        const taskMemoInput = document.getElementById('taskMemo');
        const taskStatusSelect = document.getElementById('taskStatus');

        taskNameInput.value = task.task_content || '';
        originalValues.taskName = taskNameInput.value; // Store the original value

        categoryNameInput.value = task.category_name || '';
        originalValues.categoryName = categoryNameInput.value; // Store the original value

        workNameInput.value = task.work_name || '';
        originalValues.workName = workNameInput.value; // Store the original value

        dueDateInput.value = task.due_date || '';
        originalValues.dueDate = dueDateInput.value; // Store the original value

        taskMemoInput.value = task.task_memo || '';
        originalValues.taskMemo = taskMemoInput.value; // Store the original value

        // Convert do_dates string to an array
        let doDatesArray = task.do_dates ? task.do_dates.split(',') : [];
        populateDoDates(doDatesArray);

        taskStatusSelect.value = task.task_status || '';
        originalValues.taskStatus = taskStatusSelect.value; // Store the original value
        console.log('taskStatusSelect.value',taskStatusSelect.value);

//        // Map numeric status to corresponding text
//        const statusMap = {
//            0: "Not Started",
//            1: "In Progress",
//            2: "Completed",
//            3: "Canceled",
//            4: "On Hold",
//            5: "Delegation"
//        };
//        const statusText = statusMap[task.task_status] || "";
//
//        statusRadios.forEach(radio => {
//            radio.checked = (radio.nextSibling.textContent.trim() === statusText);
//        });
//        originalValues.taskStatus = statusText; // Store the original value

        // Add blur event listeners
        taskNameInput.addEventListener('blur', handleBlur);
        categoryNameInput.addEventListener('blur', handleBlur);
        workNameInput.addEventListener('blur', handleBlur);
        dueDateInput.addEventListener('blur', handleBlur);
        taskMemoInput.addEventListener('blur', handleBlur);
        taskStatusSelect.addEventListener('blur', handleBlur);
//        statusRadios.forEach(radio => {
//            radio.addEventListener('change', handleRadioChange);
//        });
    } else {
        console.error('Invalid task object:', task);
    }
}

function handleBlur(event) {
    const id = event.target.id;
    let currentValue;

    switch (id) {
        case 'taskName':
            currentValue = event.target.value;
            if (currentValue !== originalValues.taskName) {
                saveTaskData();
            }
            break;
        case 'categoryName':
            currentValue = event.target.value;
            if (currentValue !== originalValues.categoryName) {
                saveTaskData();
            }
            break;
        case 'workName':
            currentValue = event.target.value;
            if (currentValue !== originalValues.workName) {
                saveTaskData();
            }
            break;
        case 'dueDate':
            currentValue = event.target.value;
            if (currentValue !== originalValues.dueDate) {
                saveTaskData();
            }
            break;
        case 'taskMemo':
            currentValue = event.target.value;
            if (currentValue !== originalValues.taskMemo) {
                saveTaskData();
            }
            break;
        case 'taskStatus':
            currentValue = event.target.value;
            if (currentValue !== originalValues.taskStatus) {
                saveTaskData();
            }
            break;
    }
}

//function handleRadioChange(event) {
//    const selectedValue = event.target.nextSibling.textContent.trim();
//    if (selectedValue !== originalValues.taskStatus) {
//        saveTaskData();
//    }
//}

    function toggleTaskCompletion(index) {
        tasks[index].completed = !tasks[index].completed;
        renderTaskList();
        daysOfWeek.forEach(day => renderDayTasksList(day));
    }

    // Add a click event listener to each task item
    taskList.addEventListener('click', function(event) {
        const listItem = event.target.closest('li.task-item');
        if (listItem) {
            const taskId = listItem.getAttribute('data-task-id');
            sessionStorage.setItem('detailID', taskId);
            fetchTaskDetails();
        }
    });

    function fetchNotAssignedTasks() {
        // taskList 요소를 가져옴
        const taskList = document.getElementById('taskList');

        // 기존 목록을 초기화
        taskList.innerHTML = '';

        // 서버에서 JSON 데이터를 받아옴
        fetch('/api/tasksNotAssigned')
            .then(response => response.json())
            .then(data => {
                // 받아온 데이터를 기반으로 리스트를 생성
                data.forEach(taskhub => {
                    // li 요소 생성
                    const li = document.createElement('li');
                    li.classList.add('task-item');
                    li.dataset.taskId = taskhub.task_id; // data-task-id 속성 추가

                    // 체크박스 요소 생성
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    li.appendChild(checkbox);

                    // taskContainer 요소 생성
                    const taskContainer = document.createElement('a'); // Use <a> to wrap all content
                    taskContainer.classList.add('task_content');

                    // task_content 요소 생성
                    const taskContent = document.createElement('span');
                    taskContent.textContent = taskhub.task_content;
                    taskContent.classList.add('task_content');

                    // Apply CSS class if task_status is 2
                    if (taskhub.task_status == 2) {
                        taskContainer.classList.add('task-status-completed'); // Add custom class
                    }

                    // work_name 요소 생성
                    const workName = document.createElement('span');
                    workName.classList.add('work_name');
                    workName.textContent = taskhub.work_name;

                    // due_date 요소 생성
                    const dueDate = document.createElement('span');
                    dueDate.classList.add('due_date');
                    dueDate.textContent = taskhub.due_date;

                    // Append taskContent, workName, and dueDate to taskContainer
                    taskContainer.appendChild(taskContent);
                    taskContainer.appendChild(workName);
                    taskContainer.appendChild(dueDate);

                    // Append taskContainer to <li>
                    li.appendChild(taskContainer);

                    // li를 ul에 추가
                    taskList.appendChild(li);
                });
            })
            .catch(error => console.error('Error fetching taskhubList:', error));
    }

    function fetchTaskDetails() {
        const taskId = sessionStorage.getItem('detailID');

        if (!taskId) {
            clearTaskDetailContent();
            return; // 값이 없으므로 함수를 종료
        }

        fetch(`/api/findById/${taskId}`)
            .then(response => response.text()) // Read response as text
            .then(text => {
                if (text) {
                    try {
                        const data = JSON.parse(text); // Parse text as JSON
                        showTaskDetail(data); // Pass parsed data to showTaskDetail
                    } catch (error) {
                        console.error('Error parsing JSON:', error);
                    }
                } else {
                    console.error('Empty response body');
                }
            })
            .catch(error => console.error('Error fetching task details:', error));
    }

    function clearTaskDetailContent() {
        // taskDetailContent 요소를 선택
        const taskDetailContent = document.getElementById('taskDetailContent');

        // 모든 input 요소를 선택하고 값 비우기
        const inputs = taskDetailContent.querySelectorAll('input[type="text"], input[type="date"], textarea');
        inputs.forEach(input => {
            input.value = ''; // 입력 필드 값 초기화
        });

        // 모든 select 요소를 선택하고 기본 옵션으로 설정
        const selects = taskDetailContent.querySelectorAll('select');
        selects.forEach(select => {
            select.selectedIndex = 0; // 기본 옵션으로 설정
        });

        // 모든 radio 버튼을 선택하고 선택 해제
        const radios = taskDetailContent.querySelectorAll('input[type="radio"]');
        radios.forEach(radio => {
            radio.checked = false; // 선택 해제
        });
    }

    function fetchTasksByDateRange() {
        const storedBaseDate = sessionStorage.getItem('baseDate');
        let isoDate = '';
        if (storedBaseDate) {
            const pBaseDate = new Date(storedBaseDate);
            // 유효한 Date 객체인지 확인
            if (!isNaN(pBaseDate.getTime())) {
                isoDate = pBaseDate.getFullYear() + '-' +
                          String(pBaseDate.getMonth() + 1).padStart(2, '0') + '-' +
                          String(pBaseDate.getDate()).padStart(2, '0');
            } else {
                console.error("Invalid date in sessionStorage");
            }
        }

        // fetch 요청을 보낼 때 isoDate가 빈 문자열이면, 서버로 baseDate 없이 요청을 보냄
        fetch(`/api/tasks${isoDate ? `?baseDate=${isoDate}` : ''}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (!Array.isArray(data)) {
                    throw new Error('Fetched data is not an array');
                }
                tasks = data;
                tasksByDay = tasks.reduce((acc, task) => {
                    const day = task.day_of_week;
                    if (!acc[day]) {
                        acc[day] = [];
                    }
                    acc[day].push(task);
                    return acc;
                }, {});
                renderDayTitlesList();
                Object.keys(tasksByDay).forEach(day => renderDayTasksList(day));
            })
            .catch(error => console.error('Error fetching tasks:', error));
    }

    function fetchTasksByDay() {
        // Retrieve baseDate from sessionStorage
        const storedBaseDate = sessionStorage.getItem('baseDate');
        const day = sessionStorage.getItem('nav'); // Get the specified day
        let isoDate = '';
console.log('fetchTasksByDay',storedBaseDate, day);
        if (storedBaseDate) {
            const pBaseDate = new Date(storedBaseDate);
            // Check if the date object is valid
            if (!isNaN(pBaseDate.getTime())) {
                isoDate = pBaseDate.getFullYear() + '-' +
                          String(pBaseDate.getMonth() + 1).padStart(2, '0') + '-' +
                          String(pBaseDate.getDate()).padStart(2, '0');
            } else {
                console.error("Invalid date in sessionStorage");
            }
        }

        // Fetch tasks with baseDate parameter if it exists
        fetch(`/api/tasks${isoDate ? `?baseDate=${isoDate}` : ''}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (!Array.isArray(data)) {
                    throw new Error('Fetched data is not an array');
                }
                tasks = data;
                tasksByDay = tasks.reduce((acc, task) => {
                    const taskDay = task.day_of_week;
                    if (!acc[taskDay]) {
                        acc[taskDay] = [];
                    }
                    acc[taskDay].push(task);
                    return acc;
                }, {});

                // Only render the tasks for the specified day
                if (tasksByDay[day]) {
                    renderDayTitlesList(day); // Render the day titles
                    renderDayTasksList(day); // Render the tasks for the specific day
                } else {
                    console.error(`No tasks found for the day: ${day}`);
                }
            })
            .catch(error => console.error('Error fetching tasks:', error));
    }

    function fetchStatus(pstat) {
        const taskStatus = pstat;
        fetch(`/api/findByStatus/${taskStatus}`)
            .then(response => response.json())
            .then(data => {
                taskList.innerHTML = ''; // Clear current list

                data.forEach(task => {
                    const li = document.createElement('li');
                    li.className = 'task-item';
                    li.setAttribute('data-task-id', task.task_id);

                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.checked = task.status === 'Completed';
                    checkbox.className = 'task-checkbox';

                    const taskContainer = document.createElement('a'); // Use <a> to wrap all content
                    taskContainer.className = 'task_content';

                    const taskContentSpan = document.createElement('span');
                    taskContentSpan.textContent = task.task_content;
                    taskContentSpan.className = 'task_content';

                    const workNameSpan = document.createElement('span');
                    workNameSpan.textContent = task.work_name;
                    workNameSpan.className = 'work_name';

                    const dueDateSpan = document.createElement('span');
                    dueDateSpan.textContent = task.due_date;
                    dueDateSpan.className = 'due_date';

                    // Append spans to the taskContainer
                    taskContainer.appendChild(taskContentSpan);
                    taskContainer.appendChild(workNameSpan);
                    taskContainer.appendChild(dueDateSpan);

                    // Apply CSS class if task_status is 2
                    if (task.task_status === 2) {
                        taskContainer.classList.add('task-status-completed'); // Add custom class
                    }

                    // Append checkbox and taskContainer to <li>
                    li.appendChild(checkbox);
                    li.appendChild(taskContainer);

                    // Append <li> to taskList
                    taskList.appendChild(li);
                });
            })
            .catch(error => console.error('Error fetching tasks:', error));
    }

    // 요일 제목 만듦
    function renderDayTitlesList(aDay) {
        daysList.innerHTML = '';

        if (aDay == null) {
            // Render all days
            daysOfWeek.forEach(day => {
                const ul = document.createElement('ul');
                ul.id = `${day}Tasks`; // Ensure the ID matches what is used in renderDayTasksList

                const li = document.createElement('li');
                li.innerHTML = `<strong>[[ </string><strong class="custom-day-font">${day}</strong><strong> ]]</string>`;
                //li.innerHTML = `<strong>[[ ${day} ]]</strong>`;
                li.appendChild(ul);
                daysList.appendChild(li);
            });
        } else {
            // Render only the selected day
            const ul = document.createElement('ul');
            ul.id = `${aDay}Tasks`; // Use the provided day for the ID

            const li = document.createElement('li');
            li.innerHTML = `<strong>[[ </string><strong class="custom-day-font">${aDay}</strong><strong> ]]</string>`;
            //li.innerHTML = `<strong>[[ ${day} ]]</strong>`;
//            li.innerHTML = `<strong>[[ ${aDay} ]]</strong>`;
            li.appendChild(ul);
            daysList.appendChild(li);
        }
    }

    function renderDayTasksList(day) {
        const taskListForDay = document.getElementById(`${day}Tasks`);
        if (!taskListForDay) {
            console.error(`No element found with ID: ${day}Tasks`);
            return;
        }
        taskListForDay.innerHTML = '';

//    console.log('taskListForDay: ', taskListForDay,' / day: ', day);
        if (tasksByDay[day]) {
            tasksByDay[day].forEach((task, index) => {
                const li = document.createElement('li');
                li.className = 'day-item'; // Add class to the <li>

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.checked = task.status === '2'; // Change this based on your task status logic
                checkbox.className = 'task-checkbox'; // Add class to the checkbox
                checkbox.addEventListener('change', () => toggleTaskCompletion(index));

                // Create a container for task content, work name, and due date
                const taskContainer = document.createElement('a'); // Use <a> to wrap all content
                taskContainer.className = 'task_content';

                const taskContentSpan = document.createElement('span');
                taskContentSpan.textContent = task.task_content;
                taskContentSpan.className = 'task_content'; // Add class to the task content

                // Apply CSS class if task_status is 2
                if (task.task_status == 2) {
                    taskContainer.classList.add('task-status-completed'); // Add custom class
                }

                const workNameSpan = document.createElement('span');
                workNameSpan.textContent = task.work_name;
                workNameSpan.className = 'work_name';

                const dueDateSpan = document.createElement('span');
                dueDateSpan.textContent = task.due_date;
                dueDateSpan.className = 'due_date';

                // Append taskContentSpan, workNameSpan, and dueDateSpan to taskContainer
                taskContainer.appendChild(taskContentSpan);
                taskContainer.appendChild(workNameSpan);
                taskContainer.appendChild(dueDateSpan);

                li.appendChild(checkbox);
                li.appendChild(taskContainer);

                li.addEventListener('click', () => {
                    sessionStorage.setItem('detailID', task.task_id);
                    fetchTaskDetails(); // Pass task_id to function
                });

                taskListForDay.appendChild(li);
            });
        } else {
            console.log(`No tasks available for ${day}`);
        }
    }


    // Add a click event listener to each task item
    taskList.addEventListener('click', function(event) {
        const listItem = event.target.closest('li.task-item');
        if (listItem) {
            const taskId = listItem.getAttribute('data-task-id');
            sessionStorage.setItem('detailID', taskId);
            fetchTaskDetails();
        }
    });

    taskForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const formData = new FormData(taskForm);
            const action = event.submitter.value;

            console.log('event.submitter.value;'+ event.submitter.value);
            // Check if any input fields are empty
            if(action == 'TASK+' && taskInput.value.trim() === '') {
                showNotification('Enter a task', 'error');
                return; // Prevent form submission
            }
            if(action == 'WORK+' && workInput.value.trim() === '') {
                showNotification('Enter a work', 'error');
                return; // Prevent form submission
            }

            // selectedDate가 null이 아닐 때 do_dates에 추가
//            if (sessionStorage.getItem('baseDate') !== null && sessionStorage.getItem('baseDate') !== '') {
            if (selectedDate !== null && selectedDate !== '') {
//                formData.append('do_dates', sessionStorage.getItem('baseDate'));
                formData.append('do_dates', selectedDate);
            }

            formData.append('action', action);
//            console.log("태스크 저장~ sessionStorage.getItem('baseDate')?? "+sessionStorage.getItem('baseDate'));
            console.log("태스크 저장~ selectedDate?? "+selectedDate);


            fetch('/api/save', {
                method: 'POST',
                body: formData,
            })
            .then(response => response.json())
            .then(data => {
                taskInput.value = '';
                workInput.value = '';
                if(sessionStorage.getItem('nav') === null || sessionStorage.getItem('nav') === ''){
                    fetchTasksByDateRange(); // 성공적으로 저장한 후 태스크 리스트를 새로 고침
                }else{
                    fetchTasksByDay();
                }
                refresh = true;
                fetchTasksAdded(refresh);
                fetchTaskDetails();

            })
            .catch((error) => {
                console.error('Error:', error);
            });
        });

    function fetchTasksAdded(refresh) {
        fetchNewId();
        fetch(`/api/tasksAdded`)
            .then(response => response.json())
            .then(data => {
                tasks = data;
//                fetchTaskDetails(idToShowDetail);
                if (refresh) {
//                    sessionStorage.setItem('nav', selectedDay);
                    //location.reload();
//                    fetchTasksByDateRange();
                fetchNotAssignedTasks();
                fetchTaskDetails();
                    refresh = false;
                }
            })
            .catch(error => console.error('Error fetching tasks:', error));
    }

    function fetchNewId() {
        fetch(`/api/newId`)
            .then(response => response.json()) // Convert the response to JSON
            .then(id => {
                sessionStorage.setItem('detailID', id);
            })
            .catch(error => console.error('Error fetching ID:', error));
    }

    saveChangesButton.addEventListener('click', (event) => {
        event.preventDefault(); // Prevent the form from submitting the default way
        const datesString = getDatesString();
        // Collect form data
        const taskData = {
            task_content: document.getElementById('taskName').value,
            // categoryName: document.getElementById('categoryName').value,
            // workName: document.getElementById('workName').value,
            due_date: document.getElementById('dueDate').value,
            do_dates: datesString,
//            task_status: document.querySelector('input[name="status"]:checked').value,
            task_status: document.getElementById('taskStatus').value,
            task_memo: document.getElementById('taskMemo').value
        };

        const idForDetail = sessionStorage.getItem('detailID');
//        sessionStorage.setItem('detailID', currentIdLocal);
        // Send data to the server
        fetch(`/api/updateTask/${idForDetail}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(taskData)
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            //successModal.style.display = 'block';
            showNotification('Successfully updated!', 'success');
            if(sessionStorage.getItem('nav') === null || sessionStorage.getItem('nav') === ''){
                fetchTasksByDateRange(); // 성공적으로 저장한 후 태스크 리스트를 새로 고침
            }else{
                fetchTasksByDay();
            }
            fetchNotAssignedTasks();
            fetchTaskDetails();
        })
        .catch((error) => {
            console.error('Error:', error);
            // Handle error (e.g., show an error message)
        });
    });

    deleteConfirmationButton.addEventListener('click', (event) => {
        event.preventDefault(); // Prevent the form from submitting the default way
        deleteConfirmationModal.style.display = 'block';
    });

    confirmDeleteButton.addEventListener('click', () => {
//    deleteConfirmationButton.addEventListener('click', (event) => {
//        console.log('selectedDay? delete: ',selectedDay);
        const curId = sessionStorage.getItem('detailID');
        if (curId) {
            // Send delete request to the server
            fetch(`/api/deleteTask/${curId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => {
                console.log('Deleted:', data);
                // Handle success (e.g., show a message, remove the task from the list, etc.)
                deleteConfirmationModal.style.display = 'none';
                showNotification('Task deleted.', 'delete');

                sessionStorage.setItem('detailID', '');
                if(sessionStorage.getItem('nav') === null || sessionStorage.getItem('nav') === ''){
                    fetchTasksByDateRange(); // 성공적으로 저장한 후 태스크 리스트를 새로 고침
                }else{
                    fetchTasksByDay();
                }
                fetchNotAssignedTasks();
                fetchTaskDetails();
            })
            .catch((error) => {
                console.error('Error:', error);
            });
        }
    });

    cancelDeleteButton.addEventListener('click', () => {
        deleteConfirmationModal.style.display = 'none';
    });

    // Close the delete confirmation modal when the user clicks anywhere outside of the modal
    window.addEventListener('click', (event) => {
        if (event.target === deleteConfirmationModal) {
            deleteConfirmationModal.style.display = 'none';
        }
    });

    // Function to populate categories
    function populateCategories() {
        fetch('/api/categories')
            .then(response => response.json())
            .then(categories => {
                categoriesList = categories; // 전역 변수에 저장
                const categorySelect = document.getElementById('categoryName');
                categorySelect.innerHTML = ''; // Clear any existing options

                // Create and append default option
                const defaultOption = document.createElement('option');
                defaultOption.value = '';
                defaultOption.textContent = 'Select a category';
                categorySelect.appendChild(defaultOption);

                // Create and append each category option
                categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.category_id;
                    option.textContent = category.category_name;
                    categorySelect.appendChild(option);
                });
            })
            .catch(error => console.error('Error fetching categories:', error));
    }

    const populateDoDates = (dates) => {
        const doDatesContainer = document.getElementById('doDatesContainer');
        doDatesContainer.innerHTML = ''; // Clear existing dates

        dates.forEach((date, index) => {
            const dateInputGroup = document.createElement('div');
            dateInputGroup.className = 'date-group';

            const dateInput = document.createElement('input');
            dateInput.type = 'date';
            dateInput.value = date; // Assuming the date is in YYYY-MM-DD format
            dateInput.id = `doDates_${index}`; // Unique ID

            // Track the original value of the date input
            let originalValue = dateInput.value;

            const removeButton = document.createElement('button');
            removeButton.type = 'button';
            removeButton.className = 'date-button remove';
            removeButton.textContent = '-';
            removeButton.addEventListener('click', () => {
//                console.log('remove click??populate');
                dateInputGroup.remove();
                saveTaskData(); // Save changes when removing a date
            });

//            sessionStorage.setItem('baseDate', );
            // Add blur event listener to check if value has changed
            dateInput.addEventListener('blur', (event) => {
                if (event.target.value !== originalValue) {
                    saveTaskData(); // Call your function if the value has changed
                }
            });

            dateInputGroup.appendChild(dateInput);
            dateInputGroup.appendChild(removeButton);

            doDatesContainer.appendChild(dateInputGroup);
        });
    };


    const addDateInputGroup = () => {
        // Get the current number of date input groups
        const index = document.querySelectorAll('#doDatesContainer .date-group').length;

        // Create a new div element for the date group
        const newDateInputGroup = document.createElement('div');
        newDateInputGroup.className = 'date-group';

        // Create a new date input element
        const newDateInput = document.createElement('input');
        newDateInput.type = 'date';
        newDateInput.id = `doDates_${index}`; // Set a unique ID for the new date input

        let originalValue = newDateInput.value;

        // Create a new remove button element
        const newRemoveButton = document.createElement('button');
        newRemoveButton.type = 'button';
        newRemoveButton.className = 'date-button remove';
        newRemoveButton.textContent = '-';
        newRemoveButton.addEventListener('click', () => {
//            console.log('remove click??addDate');
            newDateInputGroup.remove(); // Remove the date group when the remove button is clicked
            saveTaskData(); // Save changes when removing a date
        });

        // Add blur event listener to check if value has changed
        newDateInput.addEventListener('blur', (event) => {
        console.log('add button blur:: event.target.value: ',originalValue, '// event.target.value:',event.target.value);
            if (event.target.value !== originalValue) {
                saveTaskData(); // Call your function if the value has changed
            }
        });

        // Append the date input and remove button to the date group
        newDateInputGroup.appendChild(newDateInput);
        newDateInputGroup.appendChild(newRemoveButton);

        // Append the new date group to the container
        const doDatesContainer = document.getElementById('doDatesContainer');
        doDatesContainer.appendChild(newDateInputGroup);
    };


    // Add event listener to the add date button
    addDateButton.addEventListener('click', addDateInputGroup);

    const getDatesString = () => {
        // Select all date input elements
        const dateInputs = document.querySelectorAll('#doDatesContainer input[type="date"]');

        // Convert NodeList to array, extract values, filter out empty values
        const datesArray = Array.from(dateInputs)
            .map(input => input.value)
            .filter(value => value); // Remove empty values

        // Sort the dates in ascending order
        datesArray.sort((a, b) => new Date(a) - new Date(b));

        // Join the sorted dates with commas
        return datesArray.join(',');
    };

    function handleNavItemClick(event) {
        const target = event.target.closest('.nav-item');
        if (!target) return; // 클릭된 요소가 .nav-item이 아닐 경우

console.log('handleNavItemClick~');
        const clickedDay = target.dataset.day || '';
        const date = target.dataset.date || '';
        sessionStorage.setItem('baseDate', date);

        if (selectedSide === 'week') {
console.log('22~');
            if (sessionStorage.getItem('nav') === clickedDay) { // 날짜 선택 해제
console.log('33~');
                sessionStorage.setItem('nav', '');
                selectedDate = null;
                sessionStorage.setItem('baseDate', '');
                target.classList.remove('active'); // 배경색 원래대로
                fetchTasksByDateRange();
            } else { // 날짜 새로 선택
console.log('44~',date,clickedDay);
                sessionStorage.setItem('nav', clickedDay);
                selectedDate = date;
                sessionStorage.setItem('baseDate', date);
                document.querySelectorAll('.nav-item').forEach(item => {
                    item.classList.remove('active');
                });
                target.classList.add('active'); // 배경색 변경
                fetchTasksByDay();
            }
        }
    }

    // TODAY 버튼 클릭 이벤트 핸들러
    document.getElementById('today-button').addEventListener('click', function(event) {
        event.stopPropagation(); // 상위 요소로 이벤트 전파를 막음

        sessionStorage.setItem('today', 'true');
        const today = new Date();
        const date = formatDate(today);
        const weekday = daysOfWeek[(today.getDay() + 6) % 7]; // 'MON', 'TUE' 형식의 요일

        document.querySelectorAll('.category-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`.category-item[data-category="week"]`).classList.add('active');
        updateNavigationBar('week');
        updateWeekDisplay();
        updateWeekDates();
        sessionStorage.setItem('today', 'false');
        selectedSide = 'week';

        // 실제 .nav-item 요소를 찾기
        const target = findNavItemByDate(date);

        if (target) {
            // 가상의 이벤트 객체를 생성하지 않고 실제 클릭 이벤트를 시뮬레이션
            handleNavItemClick({ target });
//        clickCategory('week');
            showForm(); // 폼을 보이게 함
            fetchNotAssignedTasks();
            fetchTaskDetails();
        } else {
            console.error('No matching .nav-item found for the date:', date);
        }
    });


    // 클릭된 .nav-item을 찾는 함수
    function findNavItemByDate(date) {
        return document.querySelector(`.nav-item[data-date="${date}"]`);
    }

    function triggerNavItemClick(dayName) {
        const navItem = [...document.querySelectorAll('.nav-item')].find(item => item.dataset.day === dayName);
        console.log('triggerNavItemClick!!');
        if (navItem) {
            // 클릭 이벤트 객체 생성
            const clickEvent = new MouseEvent('click', {
                bubbles: true, // 이벤트가 상위 요소로 전파되도록
                cancelable: true, // 이벤트를 취소할 수 있도록
                view: window // 이벤트가 브라우저 창을 참조하도록
            });

            // 클릭 이벤트 디스패치
            navItem.dispatchEvent(clickEvent);
        } else {
            console.error(`No nav-item found for day: ${dayName}`);
        }
    }

    function fetchTasks(whatDay) {
        fetch(`/api/tasks`)
            .then(response => response.json())
            .then(data => {
                taskList.innerHTML = '';

                // Filter tasks based on the day of the week
                const filteredTasks = data.filter(task => task.day_of_week === whatDay);

                // Add new tasks to the taskList
                filteredTasks.forEach(task => {
                    const li = document.createElement('li');
                    li.className = 'task-item';
                    li.setAttribute('data-task-id', task.task_id);

                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.checked = task.status === '2';
                    checkbox.className = 'task-checkbox';

                    const taskContainer = document.createElement('a'); // Use <a> to wrap all content
                    taskContainer.className = 'task_content';

                    const taskContentSpan = document.createElement('span');
                    taskContentSpan.textContent = task.task_content;
                    taskContentSpan.className = 'task_content';

                    const workNameSpan = document.createElement('span');
                    workNameSpan.textContent = task.work_name;
                    workNameSpan.className = 'work_name';

                    const dueDateSpan = document.createElement('span');
                    dueDateSpan.textContent = task.due_date;
                    dueDateSpan.className = 'due_date';

                    // Append spans to the taskContainer
                    taskContainer.appendChild(taskContentSpan);
                    taskContainer.appendChild(workNameSpan);
                    taskContainer.appendChild(dueDateSpan);

                    // Apply CSS class if task_status is 2
                    if (task.task_status === 2) {
                        taskContainer.classList.add('task-status-completed'); // Add custom class
                    }

                    // Append checkbox and taskContainer to <li>
                    li.appendChild(checkbox);
                    li.appendChild(taskContainer);

                    // Append <li> to taskList
                    taskList.appendChild(li);
                });
            })
            .catch(error => console.error('Error fetching tasks:', error));
    }

    // Utility function to format a date as YYYY-MM-DD
    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function closeWarningModal() {
        validationModal.style.display = 'none';
    }

    // Close the modal when the user clicks on <span> (x)
    window.closeWarningModal = closeWarningModal;

    function showNotification(message, type = 'success') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        // Add notification to container
        const container = document.getElementById('notificationContainer');
        container.appendChild(notification);

        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.classList.add('hide');
            setTimeout(() => notification.remove(), 200); // Remove element after fade-out
        }, 1500);
    }
    function saveTaskData() {
        // Programmatically trigger the click event on saveChangesButton
        saveChangesButton.click();
    }
});
