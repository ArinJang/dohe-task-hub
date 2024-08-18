document.addEventListener('DOMContentLoaded', function() {
    const categoryList = document.getElementById('category-list');
    const weekDisplay = document.getElementById('week-display');
    const navigationBar = document.getElementById('navigation-bar');
    const listDetail = document.getElementById('list-detail');
    const taskInput = document.getElementById('taskInput');
    const workInput = document.querySelector('.work-input');
    const addTaskButton = document.getElementById('addTaskButton');
    const taskList = document.getElementById('taskList');
    const dayList = document.getElementById('dayList');
    const daysList = document.querySelector('.days-list');
    const taskDetail = document.getElementById('taskDetail');
    const form = document.getElementById('taskForm');
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
//    var currentIdLocal = sessionStorage.getItem('detailID');
//    var currentSide = sessionStorage.getItem('side');
//    var reloadNav = sessionStorage.getItem('nav');
//    var baseDate = sessionStorage.getItem('baseDate');
    var selectedNav = null;
    var selectedDay = null;
//    sessionStorage.setItem('nav','');
    console.log("TOP++ sessionStorage.getItem('nav')?! ",sessionStorage.getItem('nav'));

//    if (sessionStorage.getItem('detailID')) {
//        fetchTaskDetails(sessionStorage.getItem('detailID'));
//        sessionStorage.setItem('detailID', '');
//    }

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
//    let baseDate = new Date();



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
        return `${startMonthDay} ~ ${endMonthDay}`;
    }

    function updateWeekDisplay() {
        const startDate = getStartDateOfWeek(currentYear, currentMonth, currentWeek);
//        console.log('baseDate::: '+baseDate);
//        baseDate = startDate;
        sessionStorage.setItem('baseDate', startDate);
        weekDisplay.textContent = getFormattedWeekRange(startDate);
    }

    // NavigationBar 업데이트 함수
    function updateWeekDates() {
        navigationBar.innerHTML = '';
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
//                if (selectedNav && selectedNav !== this) {
//                    // 기존에 활성화된 항목이 있으면 비활성화
//                    selectedNav.classList.remove('active');
//                }

//                if (selectedNav === this) {
//                    // 클릭한 항목이 이미 활성화된 항목이라면 비활성화
//                    selectedNav = null;
////                    this.classList.remove('active');
////                    //daysList.style.display = 'block'; // Show daysList
////                    fetchTasks(null); // 모든 작업을 가져오기
//                } else {
//                    // 클릭한 항목을 활성화
//                    selectedNav = this;
////                    this.classList.add('active');
////                    //daysList.style.display = 'none'; // Hide daysList
////                    fetchTasks(this.dataset.day); // 선택된 요일에 맞는 작업을 가져오기
//                }
            });
            navigationBar.appendChild(dayDateContainer);
        });

//        addNavigationBarEventListeners(); // Ensure event listeners are attached after updating
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
        } else if (category === 'work' || category === 'delegation') {
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

    function updateContent(day, date) {
        //listDetail.innerHTML = `<h3>${day} - ${date}</h3><p>Content for ${day}, ${date}</p>`;
    }

    categoryList.addEventListener('click', function(event) {
        selectedSide = event.target.getAttribute('data-category');
        console.log('selectedSide?? ',selectedSide);
        if (event.target.classList.contains('category-item')) {
            setCategory(selectedSide);
        }
        fetchTasksByDateRange(); // Call this first
        renderDaysList(); // Ensure days list is rendered first
    });

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
        renderDaysList(); // Ensure days list is rendered first
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
        renderDaysList(); // Ensure days list is rendered first
    });

    function initialize() {
        fetchTasksByDateRange(); // Call this first
//        renderDaysList(); // Ensure days list is rendered first
        const today = new Date();
        currentMonth = today.getMonth();
        currentYear = today.getFullYear();
        currentWeek = getWeekOfMonth(today);
        setCategory('week'); // Default category
        populateCategories(); // Call the function to populate categories on page load

        // 이벤트 리스너 등록
        navigationBar.addEventListener('click', handleNavItemClick);

        if(sessionStorage.getItem('nav') && sessionStorage.getItem('nav').trim() !== '') triggerNavItemClick(sessionStorage.getItem('nav'));

    }

    initialize(); // Call initialize to set up the UI

    function showTaskDetail(task) {
        if (task && typeof task === 'object') {
            // Update the values of the form fields with the task details
            document.getElementById('taskName').value = task.task_content || '';
            document.getElementById('categoryName').value = task.category_name || ''; // Adjust if you have a category field
            document.getElementById('workName').value = task.work_name || ''; // Adjust if you have a work field
            document.getElementById('dueDate').value = task.due_date || '';

            // Convert do_dates string to an array
            let doDatesArray = task.do_dates ? task.do_dates.split(',') : [];
            populateDoDates(doDatesArray);
//            document.getElementById('doDates').value = task.do_dates || ''; // Adjust if you have a do_dates field
            document.getElementById('taskMemo').value = task.task_memo || '';

            // Map numeric status to corresponding text
            const statusMap = {
                0: "Not Started",
                1: "In Progress",
                2: "On Hold",
                3: "Canceled",
                4: "Completed"
            };
            // Get the status text from the map
            const statusText = statusMap[task.task_status] || "";

            // Update radio button status
            const statusRadios = document.querySelectorAll('input[name="status"]');
            statusRadios.forEach(radio => {
                radio.checked = (radio.nextSibling.textContent.trim() === statusText);
            });

            // Add event listener to save button
//            const saveButton = document.getElementById('saveChangesButton');
//            saveButton.removeEventListener('click', handleSaveChanges); // Prevent multiple bindings
//            saveButton.addEventListener('click', () => handleSaveChanges(task.task_id));
        } else {
            console.error('Invalid task object:', task);
        }
    }

//    // Separate function to handle save changes
//    function handleSaveChanges() {
//        saveTaskChanges();
//    }
//
//    function saveTaskChanges() {
//        const taskName = document.getElementById('taskName').value.trim();
//        const dueDate = document.getElementById('dueDate').value;
//        const status = document.querySelector('input[name="status"]:checked')?.value || 'In Progress';
//
//        if (taskName) {
//            // Find task by taskId
//            const taskIndex = tasks.findIndex(task => task.task_id === parseInt(sessionStorage.getItem('detailID')));
//            if (taskIndex > -1) {
//                tasks[taskIndex] = { ...tasks[taskIndex], task_content: taskName, due_date: dueDate, task_status: status };
//                renderTaskList();
//                daysOfWeek.forEach(day => renderTasksForDay(day));
//                showTaskDetail(sessionStorage.getItem('detailID')); // Refresh detail view
//            }
//        }
//    }

    function toggleTaskCompletion(index) {
        tasks[index].completed = !tasks[index].completed;
        renderTaskList();
        daysOfWeek.forEach(day => renderTasksForDay(day));
    }

    // Add a click event listener to each task item
    taskList.addEventListener('click', function(event) {
        const listItem = event.target.closest('li.task-item');
        if (listItem) {
            const taskId = listItem.getAttribute('data-task-id');
            sessionStorage.setItem('detailID', taskId);
            fetchTaskDetails(taskId);
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

                    // task_content 요소 생성
                    const taskContent = document.createElement('a');
                    taskContent.classList.add('task_content');
                    taskContent.textContent = taskhub.task_content;
                    li.appendChild(taskContent);

                    // work_name 요소 생성
                    const workName = document.createElement('span');
                    workName.classList.add('work_name');
                    workName.textContent = taskhub.work_name;
                    li.appendChild(workName);

                    // due_date 요소 생성
                    const dueDate = document.createElement('span');
                    dueDate.classList.add('due_date');
                    dueDate.textContent = taskhub.due_date;
                    li.appendChild(dueDate);

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
        // sessionStorage에서 'baseDate'를 가져옴
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
                renderDaysList(); // Render days list
                // Now render tasks
                Object.keys(tasksByDay).forEach(day => renderTasksForDay(day));
            })
            .catch(error => console.error('Error fetching tasks:', error));
    }

    function fetchTasksByDay() {
        const day = sessionStorage.getItem('nav');
        fetch(`/api/tasks`)
            .then(response => response.json())
            .then(data => {
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
                    renderDaysList(day); // Render only the specified day
                    renderTasksForDay(day); // Render tasks for the specified day
                } else {
                    console.error(`No tasks found for the day: ${day}`);
                }
            })
            .catch(error => console.error('Error fetching tasks:', error));
    }

    function renderDaysList(aDay) {
        daysList.innerHTML = '';
        const daysOfWeek = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

        if (aDay == null) {
            // Render all days
            daysOfWeek.forEach(day => {
                const ul = document.createElement('ul');
                ul.id = `${day}Tasks`; // Ensure the ID matches what is used in renderTasksForDay

                const li = document.createElement('li');
                li.innerHTML = `<strong>[[ ${day} ]]</strong>`;
                li.appendChild(ul);
                daysList.appendChild(li);
            });
        } else {
            // Render only the selected day
            const ul = document.createElement('ul');
            ul.id = `${aDay}Tasks`; // Use the provided day for the ID

            const li = document.createElement('li');
            li.innerHTML = `<strong>[[ ${aDay} ]]</strong>`;
            li.appendChild(ul);
            daysList.appendChild(li);
        }
    }


    function renderTasksForDay(day) {
        const taskListForDay = document.getElementById(`${day}Tasks`);
        if (!taskListForDay) {
            console.error(`No element found with ID: ${day}Tasks`);
            return;
        }
        taskListForDay.innerHTML = '';

        if (tasksByDay[day]) {
            tasksByDay[day].forEach((task, index) => {
                const li = document.createElement('li');
                li.className = 'day-item'; // Add class to the <li>

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.checked = task.status === 'Completed'; //???????? 5로바꿔야할듯
                checkbox.className = 'task-checkbox'; // Add class to the checkbox
                checkbox.addEventListener('change', () => toggleTaskCompletion(index));

//                const text = document.createElement('span');
//                text.textContent = task.task_content;
////                text.textContent = `*${task.task_content}* - ${task.due_date}`; // Add * to the text content
//                text.className = 'task_content'; // Add class to the task content
//
//                li.appendChild(checkbox);
//                li.appendChild(text);

                // Create a container for task content, work name and due date
                const taskContainer = document.createElement('div');
                taskContainer.className = 'task-container'; // Optional class for styling

                const taskContentSpan = document.createElement('span');
                taskContentSpan.textContent = task.task_content;
                taskContentSpan.className = 'task_content'; // Add class to the task content

                const workNameSpan = document.createElement('span');
                workNameSpan.textContent = task.work_name; // Assuming task.work_name exists
                workNameSpan.className = 'work_name'; // Add class to the work name

                const dueDateSpan = document.createElement('span');
                dueDateSpan.textContent = task.due_date;
                dueDateSpan.className = 'due_date';

                // Append both spans to the task container
                taskContainer.appendChild(taskContentSpan);
                taskContainer.appendChild(workNameSpan);
                taskContainer.appendChild(dueDateSpan);

                li.appendChild(checkbox);
                li.appendChild(taskContainer);

                li.addEventListener('click', () => {
                    sessionStorage.setItem('detailID', task.task_id);
//                    console.log('::::::::::',sessionStorage.getItem('detailID'));
                    fetchTaskDetails();
                }); // Pass task_id to function
                taskListForDay.appendChild(li);
            });
        } else {
//            console.log(`No tasks available for ${day}`);
        }
    }

    form.addEventListener('submit', function(event) {
        event.preventDefault();

        const formData = new FormData(form);
        const action = event.submitter.value;

        // selectedDate가 null이 아닐 때 do_dates에 추가
        if (selectedDate !== null) {
            formData.append('do_dates', selectedDate);
        }

        formData.append('action', action);
        console.log("태스크 저장~");

        fetch('/api/save', {
            method: 'POST',
            body: formData,
        })
        .then(response => response.json())
        .then(data => {
            const taskInput = document.getElementById('taskInput');
            taskInput.value = '';
            fetchTasksByDateRange(); // 성공적으로 저장한 후 태스크 리스트를 새로 고침
            refresh = true;
            fetchTasksAdded(refresh);
        })
        .catch((error) => {
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
                    fetchTasksByDateRange();
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
            task_status: document.querySelector('input[name="status"]:checked').value,
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
            // Show the success modal
            successModal.style.display = 'block';
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

                sessionStorage.setItem('detailID', '');
//                sessionStorage.setItem('nav', selectedDay);
//                /location.reload();
                    fetchTasksByDateRange();
        fetchNotAssignedTasks();
        fetchTaskDetails();
            })
            .catch((error) => {
                console.error('Error:', error);
                // Handle error (e.g., show an error message)
            });
        }
    });

    cancelDeleteButton.addEventListener('click', () => {
        deleteConfirmationModal.style.display = 'none';
    });

    // Close the modal when the user clicks on "Close"
    closeModal.addEventListener('click', () => {
        successModal.style.display = 'none';
//        sessionStorage.setItem('detailID', currentIdLocal);
//        sessionStorage.setItem('nav', selectedDay);
//        location.reload();
                    fetchTasksByDateRange();
        fetchNotAssignedTasks();
        fetchTaskDetails();
    });

    // Close the modal when the user clicks anywhere outside of the modal
    window.addEventListener('click', (event) => {
        if (event.target === successModal) {
            successModal.style.display = 'none';
//            sessionStorage.setItem('detailID', currentIdLocal);
//            sessionStorage.setItem('nav', selectedDay);
//            location.reload();
                    fetchTasksByDateRange();
            fetchNotAssignedTasks();
        fetchTaskDetails();
        }
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

    // Function to populate do dates dynamically
    const populateDoDates = (dates) => {
        doDatesContainer.innerHTML = ''; // Clear existing dates

        dates.forEach((date, index) => {
            const dateInputGroup = document.createElement('div');
            dateInputGroup.className = 'date-group';

            const dateInput = document.createElement('input');
            dateInput.type = 'date';
            dateInput.value = date; // Assuming the date is in YYYY-MM-DD format
            dateInput.id = `doDates_${index}`; // Unique ID

            const removeButton = document.createElement('button');
            removeButton.type = 'button';
            removeButton.className = 'date-button remove';
            removeButton.textContent = '-';
            removeButton.addEventListener('click', () => {
                dateInputGroup.remove();
            });

            dateInputGroup.appendChild(dateInput);
            dateInputGroup.appendChild(removeButton);

            doDatesContainer.appendChild(dateInputGroup);
        });
    };

    const addDateInputGroup = () => {
        const index = document.querySelectorAll('#doDatesContainer .date-group').length;
        const newDateInputGroup = document.createElement('div');
        newDateInputGroup.className = 'date-group';

        const newDateInput = document.createElement('input');
        newDateInput.type = 'date';
        newDateInput.id = `doDates_${index}`; // Unique ID

        const newRemoveButton = document.createElement('button');
        newRemoveButton.type = 'button';
        newRemoveButton.className = 'date-button remove';
        newRemoveButton.textContent = '-';
        newRemoveButton.addEventListener('click', () => {
            newDateInputGroup.remove();
        });

        newDateInputGroup.appendChild(newDateInput);
        newDateInputGroup.appendChild(newRemoveButton);

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

        const clickedDay = target.dataset.day || '';
        const date = target.dataset.date || '';

//        if(sessionStorage.getItem('nav') && sessionStorage.getItem('nav').trim() !== '') {
//            target.classList.add('active'); // 배경색 변경
//            fetchTasksByDay(sessionStorage.getItem('nav'));
//            selectedDay = sessionStorage.getItem('nav');
////            sessionStorage.getItem('nav') = null;
//            return;
//        }

        if (selectedSide === 'week') {
            if (sessionStorage.getItem('nav') === clickedDay) { // 날짜 선택 해제
//                selectedDay = null;
                sessionStorage.setItem('nav', '');
                selectedDate = null;
//                reloadNav = null;
                target.classList.remove('active'); // 배경색 원래대로
                fetchTasksByDateRange();
            } else { // 날짜 새로 선택
//                selectedDay = clickedDay;
                sessionStorage.setItem('nav', clickedDay);
                selectedDate = date;
//                reloadNav = clickedDay;
                // 모든 nav-item에서 active 클래스 제거
                document.querySelectorAll('.nav-item').forEach(item => {
                    item.classList.remove('active');
                });
                target.classList.add('active'); // 배경색 변경
                fetchTasksByDay();
            }
        }
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
                    checkbox.checked = task.status === 'Completed';
                    checkbox.className = 'task-checkbox';

                    const taskContentSpan = document.createElement('a');
                    taskContentSpan.textContent = task.task_content;
                    taskContentSpan.className = 'task_content';

                    const workNameSpan = document.createElement('span');
                    workNameSpan.textContent = task.work_name;
                    workNameSpan.className = 'work_name';

                    const dueDateSpan = document.createElement('span');
                    dueDateSpan.textContent = task.due_date;
                    dueDateSpan.className = 'due_date';

                    li.appendChild(checkbox);
                    li.appendChild(taskContentSpan);
                    li.appendChild(workNameSpan);
                    li.appendChild(dueDateSpan);

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
    // Function to programmatically click a specific nav-item
//    function triggerNavItemClick(dayName) {
//        const navItem = [...document.querySelectorAll('.nav-item')].find(item => item.dataset.day === dayName);
//        if (navItem) {
//            const clickEvent = new Event('click', { bubbles: true });
//            navItem.dispatchEvent(clickEvent);
//        } else {
//            console.error(`No nav-item found for day: ${dayName}`);
//        }
//    }

//    function triggerNavItemClick(dayName) {
//        // Log to check if `dayName` matches the data-day values in the nav items
//        console.log('Triggering click for:', dayName);
//
//        // Find the nav item by `data-day`
//        const navItem = [...document.querySelectorAll('.nav-item')].find(item => item.dataset.day === dayName);
//
//        if (navItem) {
////            console.log('Found nav-item:', navItem);
//            const clickEvent = new Event('click', { bubbles: true });
//            navItem.dispatchEvent(clickEvent);
//        } else {
//            console.error(`No nav-item found for day: ${dayName}`);
//        }
//    }


    // Example usage: Trigger click on the 'SUN' nav-item
    //triggerNavItemClick('SUN');


    });
