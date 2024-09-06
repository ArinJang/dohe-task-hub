document.addEventListener('DOMContentLoaded', function() {
    const sideList = document.getElementById('side-list');
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
    const taskForm = document.getElementById('taskForm');
    const successModal = document.getElementById('successModal');
    const closeModal = document.querySelector('#successModal .close');
    let categoriesList = [];
    let dayDateMap = new Map(); // 선택된 주의 요일과 날짜 저장
    const addDateButton = document.getElementById('addDateButton');
    const doDatesContainer = document.getElementById('doDatesContainer');
    const deleteConfirmationModal = document.getElementById('deleteConfirmationModal');
    const confirmDeleteButton = document.getElementById('confirmDeleteButton');
    const cancelDeleteButton = document.getElementById('cancelDeleteButton');
    const saveChangesButton = document.getElementById('saveChangesButton');
    const deleteConfirmationButton = document.getElementById('deleteConfirmationButton');
    let daysListVisible = true;
    let selectedDate = null;
    let selectedSide = 'week';
    const daysOfWeek = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    var selectedNav = null;
    var selectedDay = null;
    const validationModal = document.getElementById('validationModal');
//    console.log("TOP++ sessionStorage.getItem('nav')?! ",sessionStorage.getItem('nav'));
    var taskDetailContent = document.getElementById('taskDetailContent');
    var detailElements = taskDetailContent.querySelectorAll('input, select, textarea');
    const taskMemoContent = document.getElementById('taskMemo');
    let orderInCertainStatus = null;
            sessionStorage.setItem('ifLoggedIn', 'false');
//    let isTaskUpdateScheduled = false;

    const loginModal = document.getElementById('loginModal');
    const closeBtn = document.getElementsByClassName('close')[0];
    const addUserModal = document.getElementById('addUserModal');

    const userInfoDiv = document.getElementById("user-info");
    search();
    const loginUserName =  sessionStorage.getItem("loginUserName");
    console.log("0 Logged in user:", loginUserName);


    // Open or close the login modal based on the loginUserName
    if (loginUserName !== null && loginUserName !== '' && loginUserName !== 'null') {
        loginModal.style.display = 'none';  // 로그인 상태에서 모달 숨김
        console.log("1 OO Logged in user:", loginUserName);
    } else {
        loginModal.style.display = 'block'; // 로그인하지 않은 상태에서 모달 표시
        console.log("2 XX Logged in user:", loginUserName);
    }
    // Handle login form submission
//    document.getElementById('loginForm').onsubmit = function(event) {
////        event.preventDefault(); // Prevent default form submission
//
//        const username = document.getElementById('username').value;
//        const password = document.getElementById('password').value;
//    }

    document.getElementById('addUser').addEventListener('click', function() {
        addUserModal.style.display = 'block';
    });
    document.querySelector('.close').addEventListener('click', () => {
        addUserModal.style.display = 'none';
    });
    document.getElementById('addUserForm').onsubmit = function(event) {
        event.preventDefault(); // Prevent default form submission
        addUserModal.style.display = 'none';
    }

    const statusMap = { // "side의 data-side" : "status"
//        'notstarted': 0,
//        'inprogress': 1,
        'completed': 2,
//        'canceled': 3,
        'onhold': 4,
        'delegation': 5,
        'plan': 6
    };

    // Define your initial tasks array (this should be replaced with your actual data fetching logic)
    let tasks = [
        { task_id: 1, task_content: 'Task 1', due_date: '2024-08-12', day_of_week: 'Monday', status: 'In Progress' },
        { task_id: 2, task_content: 'Task 2', due_date: '2024-08-13', day_of_week: 'Tuesday', status: 'Completed' },
        // ... more tasks
    ];

    var tasksByDay = tasks.reduce((acc, task) => {
        const day = task.day_of_week; // 각 task의 day_of_week 속성 값 추출
        if (!acc[day]) { // 해당 요일에 대한 배열이 아직 존재하지 않으면
            acc[day] = []; // 새로운 배열을 생성
        }
        acc[day].push(task); // 해당 요일의 배열에 task를 추가
        return acc; // 누적기(acc)를 반환하여 다음 반복에서 계속 사용
    }, {});

    let currentMonth = new Date().getMonth(); // 0-based index (0 = January)
    let currentYear = new Date().getFullYear();
    let currentWeek = getWeekOfMonth(new Date());
//    console.log('시작: ',currentYear,currentMonth,currentWeek);

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
        const dayOfMonth = date.getDate();
        const dayOfWeek = date.getDay() || 7; // Make Sunday (0) be treated as 7
        const startOfWeek = new Date(date.getFullYear(), date.getMonth(), dayOfMonth - dayOfWeek + 1);
        const firstMonday = new Date(date.getFullYear(), date.getMonth(), 1);

        if (firstMonday.getDay() !== 1) {
            firstMonday.setDate(firstMonday.getDate() + ((8 - firstMonday.getDay()) % 7));
        }

        const weekNumber = Math.ceil(((startOfWeek - firstMonday) / 86400000 + 1) / 7);
        return weekNumber;
    }

    function getStartDateOfWeek(year, month, week) {
        const firstDayOfMonth = new Date(year, month, 1);
        const firstMonday = firstDayOfMonth.getDate() + (1 - firstDayOfMonth.getDay() + 7) % 7;
        const startDate = new Date(year, month, firstMonday + (week - 1) * 7);
//        console.log('getStartDateOfWeek함수- ',startDate);
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
//        console.log('updateWeekDisplay startDate ',startDate);
        sessionStorage.setItem('nav', '');
        selectedDate = null;
        weekDisplay.textContent = getFormattedWeekRange(startDate);
    }

    // NavigationBar 업데이트 함수
    function updateWeekDates() {

        dayDateMap.clear();
        navigationBar.innerHTML = '';
        if(sessionStorage.getItem('today') === 'true') {
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

            dayDateMap.set(dayName, formatDate(date));

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
    }

    function setSide(category) {
        document.querySelectorAll('.side-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`.side-item[data-side="${category}"]`).classList.add('active');
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

    function clickSideBar(selectedSide) {
        fetchMainTaskList();
        sessionStorage.setItem('detailID', '');
        orderInCertainStatus = null;
        fetchTaskDetails();
        switch (selectedSide) {
            case 'week':
                fetchTasksByDateRange(); // Call this first
                renderDayTitlesList(); // Ensure days list is rendered first
                showForm();
                break;
            case 'onhold':
            case 'delegation':
            case 'plan':
                hideForm();
                break;
            case 'work':
                showForm();
                break;
            case 'completed':
                hideForm();
                break;
            default:
                showForm();
                break;
        }
    }

    sideList.addEventListener('click', function(event) {
        selectedSide = event.target.getAttribute('data-side');
        selectedDate = null;
//        console.log('selectedSide?? ',selectedSide);
        if (event.target.classList.contains('side-item')) {
            setSide(selectedSide);
        }
        clickSideBar(selectedSide);
    });

//    function showForm() {
//        document.querySelector('.do-dates-group').style.visibility = 'visible';
//        taskForm.style.visibility = 'visible';
//        daysList.style.visibility = 'visible';
//    }
//
//    function hideForm() {
//        document.querySelector('.do-dates-group').style.visibility = 'hidden';
//        taskForm.style.visibility = 'hidden';
//        daysList.style.visibility = 'hidden';
//    }

    function showForm() {
        document.querySelector('.do-dates-group').style.display = 'flex';
        taskForm.style.display = 'block';
        daysList.style.display = 'block';
    }

    function hideForm() {
        document.querySelector('.do-dates-group').style.display = 'none';
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
        if (document.querySelector('.side-item.active').getAttribute('data-side') === 'week') {
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
        if (document.querySelector('.side-item.active').getAttribute('data-side') === 'week') {
            updateWeekDates();
        }
//        sessionStorage.setItem('baseDate', baseDate);
        fetchTasksByDateRange(); // Call this first
        renderDayTitlesList(); // Ensure days list is rendered first
    });

    function initialize() {
        fetchMainTaskList();
        fetchTasksByDateRange(); // Call this first
//        renderDayTitlesList(); // Ensure days list is rendered first
        const today = new Date();
        currentMonth = today.getMonth();
        currentYear = today.getFullYear();
        currentWeek = getWeekOfMonth(today);
        setSide('week'); // Default category
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
    //        taskMemoInput.style.height = calcHeight(taskMemoInput.value) + "px";
    //        calcHeight(taskMemoContent);
            taskMemoInput.style.height = "auto"; // Reset height to auto to recalculate
            taskMemoInput.style.height = taskMemoContent.scrollHeight + "px"; // Set height based on the scrollHeight

            // Convert do_dates string to an array
            let doDatesArray = task.do_dates ? task.do_dates.split(',') : [];
            populateDoDates(doDatesArray);

            taskStatusSelect.value = task.task_status || '';
            originalValues.taskStatus = taskStatusSelect.value; // Store the original value

            taskNameInput.addEventListener('change', handleDetailChange);
            categoryNameInput.addEventListener('change', handleDetailChange);
            workNameInput.addEventListener('change', handleDetailChange);
            dueDateInput.addEventListener('change', handleDetailChange);
            taskMemoInput.addEventListener('change', handleDetailChange);
            taskStatusSelect.addEventListener('change', handleDetailChange);
    //        statusRadios.forEach(radio => {
    //            radio.addEventListener('change', handleRadioChange);
    //        });
        } else {
            console.error('Invalid task object:', task);
        }
    }

    function handleDetailChange(event) {
        const id = event.target.id;
        let currentValue;

        switch (id) {
    //        case 'taskName':
    //            currentValue = event.target.value;
    //            if (currentValue !== originalValues.taskName) {
    //                saveTaskData();
    //            }
    //            break;
    //        case 'categoryName':
    //            currentValue = event.target.value;
    //            if (currentValue !== originalValues.categoryName) {
    //                saveTaskData();
    //            }
    //            break;
    //        case 'workName':
    //            currentValue = event.target.value;
    //            if (currentValue !== originalValues.workName) {
    //                saveTaskData();
    //            }
    //            break;
    //        case 'dueDate':
    //            currentValue = event.target.value;
    //            if (currentValue !== originalValues.dueDate) {
    //                saveTaskData();
    //            }
    //            break;
    //        case 'taskMemo':
    //            currentValue = event.target.value;
    //            if (currentValue !== originalValues.taskMemo) {
    //                saveTaskData();
    //            }
    //            break;
            case 'taskName':
            case 'categoryName':
            case 'workName':
            case 'dueDate':
            case 'taskMemo':
                currentValue = event.target.value;
                if (currentValue !== originalValues[id]) {
                    saveTaskData(); // Save task data if changed
    //                isTaskUpdateScheduled = true; // Mark that a task update has been scheduled
                }
                break;
            case 'taskStatus':
                currentValue = event.target.value;
                console.log('case taskStatus currentValue:',currentValue,'/originalValues[id]:',originalValues[id]);
                if (currentValue !== originalValues[id]) {
                    if((originalValues[id] == 4 || originalValues[id] == 5 || originalValues[id] == 6)
                    && (currentValue == 0 || currentValue == 1 || currentValue == 2 || currentValue == 3)) {
    //                console.log('456 > 0123');
                        document.querySelector('.do-dates-group').style.display = 'flex';
                        updateOrderAndDoDate(null, '9999-12-31', null, null, sessionStorage.getItem('detailID'), currentValue);
                    } else if(currentValue == 4) {
                        document.querySelector('.do-dates-group').style.display = 'none';
                        updateDetailDoDate(sessionStorage.getItem('detailID'), '9999-01-04', currentValue);
                    } else if(currentValue == 5) {
                        document.querySelector('.do-dates-group').style.display = 'none';
                        updateDetailDoDate(sessionStorage.getItem('detailID'), '9999-01-05', currentValue);
                    } else if(currentValue == 6) {
                        document.querySelector('.do-dates-group').style.display = 'none';
                        updateDetailDoDate(sessionStorage.getItem('detailID'), '9999-01-06', currentValue);
                    } else {
                        saveTaskData(); // Save task data if changed
                    }
                }
                break;
        }
    }

    function toggleTaskCompletion(index) {
        tasks[index].completed = !tasks[index].completed;
        renderTaskList();
        daysOfWeek.forEach(day => renderDayTasksList(day));
    }

    taskList.addEventListener('click', function(event) {
        const listItem = event.target.closest('li.task-item');
        if (listItem) {
            const taskId = listItem.getAttribute('data-task-id');
            sessionStorage.setItem('detailID', taskId);
            console.log('taskList detailID: '+sessionStorage.getItem('detailID'));
            fetchTaskDetails();
        }
    });

    daysList.addEventListener('click', function(event) {
        const listItem = event.target.closest('li.task-item');
        if (listItem) {
            const taskId = listItem.getAttribute('data-task-id');
            sessionStorage.setItem('detailID', taskId);
            console.log('daysList detailID: '+sessionStorage.getItem('detailID'));
            fetchTaskDetails();
        }
    });

    function updateDetailDoDate(id, dates, status) {

        console.log("0 id: ",id,'/dates:',dates,'/status:',status);
        const taskId = id ? id : sessionStorage.getItem('detailID');
        const datesString = dates ? dates : getDatesString();
        const taskStatus = status ? status : "";
        const updateData = {
            task_id: taskId,
            do_dates: datesString,
            task_status: taskStatus
        };
        console.log("1 taskId: ",taskId,'/datesString:',datesString,'/taskStatus:',taskStatus);
        sessionStorage.setItem('detailID', taskId);

        fetch('/api/updateDetailDoDate', { // API 호출
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        })
        .then(response => response.json())
        .then(data => {
//            console.log('Success:', data);
            if(dates == null || dates == '') {
                console.log("showNotification or not?? show!");
                showNotification('Do dates successfully updated!', 'success');
            }
            if(sessionStorage.getItem('nav') === null || sessionStorage.getItem('nav') === ''){
                fetchTasksByDateRange(); // 성공적으로 저장한 후 태스크 리스트를 새로 고침
            }else{
                fetchTasksByDay();
            }
            fetchTaskDetails(); // 태스크 상세정보 갱신
            fetchMainTaskList(); // 메인 태스크 리스트 갱신

//            isTaskUpdateScheduled = true; // Mark that a do date update has been scheduled
//            processUpdates(); // Process updates
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }

    function updateOrderAndDoDate(fromDay, toDay, oldIndex, newIndex, movedTaskId, newStatus) {
        const updateData = {
            task_id: movedTaskId,
            old_do_date: fromDay,
            new_do_date: toDay,
            old_idx: oldIndex,
            new_idx: newIndex,
            task_status: newStatus
        };
        console.log('movedTaskId: ',movedTaskId);
        sessionStorage.setItem('detailID', movedTaskId);

        fetch('/api/updateOrderAndDoDate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        })
        .then(response => response.json())
        .then(data => {
//            console.log('Task updated successfully:', data);
            showNotification('Successfully updated!', 'success');
            if(sessionStorage.getItem('nav') === null || sessionStorage.getItem('nav') === ''){
                fetchTasksByDateRange(); // 성공적으로 저장한 후 태스크 리스트를 새로 고침
            }else{
                fetchTasksByDay();
            }
            fetchMainTaskList();
            fetchTaskDetails();
        })
        .catch(error => console.error('Error updating task:', error));
    }

    // Initialize Sortable.js for a given task list element
    function initSortable(taskListElement) {
        new Sortable(taskListElement, {
            group: 'shared',
            animation: 150,
            filter: '.empty-placeholder', // .empty-placeholder를 제외한 항목만 드래그할 수 있게 함
            handle: '.hamburger-icon', // Only allow dragging by the hamburger icon
            onEnd: function (evt) {
                const fromId = evt.from.id;
                const toId = evt.to.id;
                let fromDay;
                let toDay;

                if(orderInCertainStatus !== undefined && orderInCertainStatus !== null){
                    if(orderInCertainStatus == 2) {
                        showNotification('A completed task cannot be moved!', 'error');
//                        console.log('orderInCertainStatus!=null orderInCertainStatus == 2!! return');
                        fetchStatus(2);
                        return;
                    }
                    console.log('orderInCertainStatus!=null >',orderInCertainStatus);
                    fromDay = orderInCertainStatus;
                    toDay = orderInCertainStatus;
                    orderInCertainStatus = null;
                } else {
                    fromDay = fromId === 'taskList' ? 'NOTASSIGNED' : (fromId ? dayDateMap.get(fromId.replace('Tasks', '')) : 'NOTASSIGNED');
                    toDay = toId === 'taskList' ? 'NOTASSIGNED' : (toId ? dayDateMap.get(toId.replace('Tasks', '')) : 'NOTASSIGNED');
                }
//                const fromDay = fromId === 'taskList' ? 'NOTASSIGNED' : (fromId ? dayDateMap.get(fromId.replace('Tasks', '')) : 'NOTASSIGNED');
//                const toDay = toId === 'taskList' ? 'NOTASSIGNED' : (toId ? dayDateMap.get(toId.replace('Tasks', '')) : 'NOTASSIGNED');

                const taskList = Array.from(evt.from.children).map(child => {
                    return {
                        task_id: child.getAttribute('data-task-id'),
                        task_order: parseInt(child.getAttribute('data-task-order'))
                    };
                });

                const movedTaskId = evt.item.getAttribute('data-task-id');  // The task ID of the moved task
                const newIndex = evt.newIndex;
                const oldIndex = evt.oldIndex;

                if(fromDay == toDay && oldIndex == newIndex) return;
                console.log('fromDay:', fromDay, '/toDay:', toDay,'/oldIndex:',oldIndex, '/newIndex:',newIndex,'/movedTaskId:',movedTaskId);
                updateOrderAndDoDate(fromDay, toDay, oldIndex, newIndex, movedTaskId);
            }
        });
    }

    function renderDayTasksList(day) {
        const taskListForDay = document.getElementById(`${day}Tasks`);
        if (!taskListForDay) {
            console.error(`No element found with ID: ${day}Tasks`);
            return;
        }
        taskListForDay.innerHTML = '';

//        console.log('tasksByDay[day]: ',tasksByDay[day],", tasksByDay[day].length: ",tasksByDay[day].length);
        if (tasksByDay[day] && tasksByDay[day].length > 0) {
            tasksByDay[day].forEach((task, index) => {
                const taskItem = createTaskItem(task);
                taskListForDay.appendChild(taskItem);
            });
        } else {
//            console.log(`No tasks available for ${day}`);
            // Render an empty placeholder if there are no tasks
            const emptyPlaceholder = document.createElement('li');
            emptyPlaceholder.className = 'empty-placeholder';
            emptyPlaceholder.textContent = 'No tasks available';
            emptyPlaceholder.style.pointerEvents = 'none'; // Prevent any interaction with the placeholder
            emptyPlaceholder.style.cursor = 'default'; // JavaScript로 커서 설정
            taskListForDay.appendChild(emptyPlaceholder);
        }

        initSortable(taskListForDay, null);  // Initialize Sortable.js for the updated task list
    }

    function fetchMainTaskList() {
        const taskList = document.getElementById('taskList'); // Ensure taskList is correctly referenced
        if (!taskList) {
            console.error('No element found with ID: taskList');
            return;
        }
        taskList.innerHTML = ''; // Clear existing tasks

        switch (selectedSide) {
            case 'week':
                fetch('/api/tasksNotAssigned')
                    .then(response => response.json())
                    .then(data => {
                        if (data.length === 0) {
                            // Render an empty placeholder if there are no tasks
                            const emptyPlaceholder = document.createElement('li');
                            emptyPlaceholder.className = 'empty-placeholder';
                            emptyPlaceholder.textContent = 'No tasks available';
                            emptyPlaceholder.style.pointerEvents = 'none'; // Prevent any interaction with the placeholder
                            emptyPlaceholder.style.cursor = 'default'; // JavaScript로 커서 설정
                            taskList.appendChild(emptyPlaceholder);
                        } else {
                            data.forEach(task => {
                                const taskItem = createTaskItem(task);
                                taskList.appendChild(taskItem);
                            });
                        }
                        initSortable(taskList); // Use 'NOTASSIGNED' or any placeholder if needed
                    })
                    .catch(error => console.error('Error fetching tasks:', error));
                break;
            case 'onhold':
            case 'delegation':
            case 'plan':
            case 'completed':
                fetchStatus(statusMap[selectedSide]);
                break;
            case 'work':
                break;
            default:
                break;
        }
    }

    function fetchTaskDetails() {
//    console.log('fetchTaskDetails id?',sessionStorage.getItem('detailID'));
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
                        if(data.task_status == 4 ||data.task_status == 5 ||data.task_status == 6){
                            console.log('fetchTaskDetails status =456');
                            document.querySelector('.do-dates-group').style.display = 'none';
                        }
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

            // Create an array with all possible days you want to render
            const allDays = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

            // Initialize tasksByDay with empty arrays for each day
            tasksByDay = allDays.reduce((acc, day) => {
                acc[day] = [];
                return acc;
            }, {});

            // Populate tasksByDay with the actual tasks
            tasks.forEach(task => {
                const day = task.day_of_week;
                if (!tasksByDay[day]) {
                    tasksByDay[day] = [];
                }
                tasksByDay[day].push(task);
            });

            renderDayTitlesList();

            // Ensure that renderDayTasksList is called for all days, even if they are empty
            allDays.forEach(day => renderDayTasksList(day));
        })
        .catch(error => console.error('Error fetching tasks:', error));
}

    function fetchTasksByDay() {
        // Retrieve baseDate from sessionStorage
        const storedBaseDate = sessionStorage.getItem('baseDate');
        const day = sessionStorage.getItem('nav'); // Get the specified day
        let isoDate = '';
//console.log('fetchTasksByDay',storedBaseDate, day);
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
//                if (tasksByDay[day]) {
                    renderDayTitlesList(day); // Render the day titles
                    renderDayTasksList(day); // Render the tasks for the specific day
//                } else {
//                    console.error(`No tasks found for the day: ${day}`);
//                }
            })
            .catch(error => console.error('Error fetching tasks:', error));
    }

    function fetchStatus(pstat) {
    const taskStatus = pstat;
    taskList.innerHTML = ''; // Clear current list
    fetch(`/api/findByStatus/${taskStatus}`)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                data.forEach(task => {
                    const taskItem = createTaskItem(task);
                    taskList.appendChild(taskItem);
                });
            } else {
                // 태스크가 없을 때 빈 자리 표시자를 추가
                const emptyPlaceholder = document.createElement('li');
                emptyPlaceholder.className = 'empty-placeholder';
                emptyPlaceholder.textContent = 'No tasks available';
                emptyPlaceholder.style.pointerEvents = 'none'; // 상호작용 방지
                emptyPlaceholder.style.cursor = 'default'; // 커서 설정
                taskList.appendChild(emptyPlaceholder);
            }

            orderInCertainStatus = taskStatus;
            initSortable(taskList);
        })
        .catch(error => console.error('Error fetching tasks:', error));
    }

    // 요일 제목 만듦
    function renderDayTitlesList(aDay) {
        daysList.innerHTML = '';

        if (aDay == null) { // Render all days
            daysOfWeek.forEach(day => {
                const ul = document.createElement('ul');
                ul.id = `${day}Tasks`; // Ensure the ID matches what is used in renderDayTasksList

                const li = document.createElement('li');
//                console.log('!'+ dayDateMap.get(day));
                li.dataset.date = dayDateMap.get(day); //drag!!!!!!!!!!
                li.innerHTML = `<strong>[[ </string><strong class="custom-day-font">${day}</strong><strong> ]]</string>`;
                li.appendChild(ul);
                daysList.appendChild(li);
            });
        } else { // Render only the selected day
            const ul = document.createElement('ul');
            ul.id = `${aDay}Tasks`; // Use the provided day for the ID

            const li = document.createElement('li');
            li.innerHTML = `<strong>[[ </string><strong class="custom-day-font">${aDay}</strong><strong> ]]</string>`;
            li.appendChild(ul);
            daysList.appendChild(li);
        }
    }

    taskForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const formData = new FormData(taskForm);
            const action = event.submitter.value;

            console.log('event.submitter.value;'+ event.submitter.value);
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
                fetchTasksAdded();
//                fetchTaskDetails();
            })
            .catch((error) => {
                console.error('Error:', error);
            });
        });

    function fetchTasksAdded() {
        fetchNewId();
//    console.log('fetchTasksAdded id?',sessionStorage.getItem('detailID'));
        fetch(`/api/tasksAdded`)
            .then(response => response.json())
            .then(data => {
                tasks = data;
                fetchMainTaskList();
                fetchTaskDetails();
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
//        const datesString = getDatesString();

        const taskData = { // Collect form data
            task_content: document.getElementById('taskName').value,
            // categoryName: document.getElementById('categoryName').value,
            // workName: document.getElementById('workName').value,
            due_date: document.getElementById('dueDate').value,
//            do_dates: datesString,
//            task_status: document.querySelector('input[name="status"]:checked').value,
            task_status: document.getElementById('taskStatus').value,
            task_memo: document.getElementById('taskMemo').value
        };

        const idForDetail = sessionStorage.getItem('detailID');

        fetch(`/api/updateTask/${idForDetail}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(taskData)
        })
        .then(response => response.json())
        .then(data => {
//            console.log('Success:', data);
            //successModal.style.display = 'block';
            showNotification('Successfully updated!', 'success');
            if(sessionStorage.getItem('nav') === null || sessionStorage.getItem('nav') === ''){
                fetchTasksByDateRange(); // 성공적으로 저장한 후 태스크 리스트를 새로 고침
            }else{
                fetchTasksByDay();
            }
            fetchMainTaskList();
            fetchTaskDetails();
//            isTaskUpdateScheduled = true; // Mark that a task update has been scheduled
//            processUpdates(); // Process updates
        })
        .catch((error) => {
            console.error('Error:', error);
            // Handle error (e.g., show an error message)
        });
    });

//    function processUpdates() {
//        if (isTaskUpdateScheduled) {
////            fetchTasksByDateRange(); // Refresh task list
////            fetchTasksByDay(); // Refresh tasks by day
//            fetchMainTaskList(); // Refresh main task list
//            fetchTaskDetails(); // Refresh task details
//            isTaskUpdateScheduled = false; // Reset the flag
//        }
//    }

    function modifyDoDates(){
        const idForDetail = sessionStorage.getItem('detailID');
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
            fetchMainTaskList();
            fetchTaskDetails();
        })
        .catch((error) => {
            console.error('Error:', error);
            // Handle error (e.g., show an error message)
        });
    }

    deleteConfirmationButton.addEventListener('click', (event) => {
        event.preventDefault(); // Prevent the form from submitting the default way
        deleteConfirmationModal.style.display = 'block';
    });

    confirmDeleteButton.addEventListener('click', () => {
//    deleteConfirmationButton.addEventListener('click', (event) => {
//        console.log('selectedDay? delete: ',selectedDay);
        const curId = sessionStorage.getItem('detailID');
//        console.log('curId? delete: ',curId);
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
                fetchMainTaskList();
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
            let originalValue = dateInput.value; // Track the original value of the date input

            const removeButton = document.createElement('button');
            removeButton.type = 'button';
            removeButton.className = 'date-button remove';
            removeButton.textContent = '-';
            removeButton.addEventListener('click', () => {
                dateInputGroup.remove();
//                saveTaskData(); // Save changes when removing a date
                updateDetailDoDate();
            });

            // Add blur event listener to check if value has changed
//            dateInput.addEventListener('blur', (event) => {
//                if (event.target.value !== originalValue) {
////                    saveTaskData(); // Call your function if the value has changed
//                    updateDetailDoDate();
//                }
//            });
            dateInput.addEventListener('change', (event) => {
                if (event.target.value !== originalValue) {
//                    saveTaskData(); // Call your function if the value has changed
                    updateDetailDoDate();
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
//            saveTaskData(); // Save changes when removing a date
            updateDetailDoDate();
        });

        // Add blur event listener to check if value has changed
//        newDateInput.addEventListener('blur', (event) => {
//            //console.log('add button blur:: event.target.value: ',originalValue, '// event.target.value:',event.target.value);
//            if (event.target.value !== originalValue) {
////                saveTaskData(); // Call your function if the value has changed
//                updateDetailDoDate();
//            }
//        });
        newDateInput.addEventListener('change', (event) => {
            if (event.target.value !== originalValue) {
//                    saveTaskData(); // Call your function if the value has changed
                updateDetailDoDate();
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

    const getDatesString = (replacementDate = null) => {
        let datesSet = new Set();

        if (replacementDate) {
            // If a replacement date is provided, add it to the set
            datesSet.add(replacementDate);
        } else {
            // Otherwise, get the dates from the inputs as usual
            const dateInputs = document.querySelectorAll('#doDatesContainer input[type="date"]');
            dateInputs.forEach(input => {
                if (input.value) {
                    datesSet.add(input.value);
                }
            });
        }

        // Convert the set to an array and sort the dates in ascending order
        let datesArray = Array.from(datesSet);
        datesArray.sort((a, b) => new Date(a) - new Date(b));

        return datesArray.join(',');
    };


    function handleNavItemClick(event) {
        const target = event.target.closest('.nav-item');
        if (!target) return; // 클릭된 요소가 .nav-item이 아닐 경우

//console.log('handleNavItemClick~');
        const clickedDay = target.dataset.day || '';
        const date = target.dataset.date || '';
        sessionStorage.setItem('baseDate', date);

        if (selectedSide === 'week') {
//console.log('22~');
            if (sessionStorage.getItem('nav') === clickedDay) { // 날짜 선택 해제
//console.log('33~');
                sessionStorage.setItem('nav', '');
                selectedDate = null;
                sessionStorage.setItem('baseDate', '');
                target.classList.remove('active'); // 배경색 원래대로
                fetchTasksByDateRange();
            } else { // 날짜 새로 선택
//console.log('44~',date,clickedDay);
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

        document.querySelectorAll('.side-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`.side-item[data-side="week"]`).classList.add('active');
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
//        clickSideBar('week');
            showForm(); // 폼을 보이게 함
            fetchMainTaskList();
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

    // Alternatively, if you need more control, use this:
    function calcHeight(textarea) {
        textarea.style.height = "auto"; // Reset height to auto to recalculate
        textarea.style.height = textarea.scrollHeight + "px"; // Set height based on the scrollHeight
    }

    taskMemoContent.addEventListener("input", () => {
        calcHeight(taskMemoContent);
    });

    function createTaskItem(task) {
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
        if (task.task_status == 2 || task.task_status == 3) {
            taskContainer.classList.add('task-status-completed'); // Add custom class
        }

        const hamburgerIcon = document.createElement('span');
        hamburgerIcon.className = 'hamburger-icon';
        hamburgerIcon.textContent = '☰'; // Using the Unicode character for hamburger icon

        // Append checkbox and taskContainer to <li>
        //li.appendChild(checkbox);
        li.appendChild(hamburgerIcon);
        li.appendChild(taskContainer);

        return li;
    }
});
