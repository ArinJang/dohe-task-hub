document.addEventListener('DOMContentLoaded', function() {
    const sideList = document.getElementById('side-list');
    const weekDisplay = document.getElementById('week-display');
    const navigationBar = document.getElementById('navigation-bar');
    const listDetail = document.getElementById('list-detail');
    const taskInput = document.getElementById('taskInput');
    const workInput = document.getElementById('workInput');
    const workInputArea = document.querySelector('.work-input');
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
    const deleteConfirmationModalWork = document.getElementById('deleteConfirmationModalWork');
    const saveChangesButton = document.getElementById('saveChangesButton');
    let daysListVisible = true;
    let selectedDate = null;
    let selectedSide = 'week';
    const daysOfWeek = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    var selectedNav = null;
    var selectedDay = null;
    const validationModal = document.getElementById('validationModal');
    var taskDetailContent = document.getElementById('taskDetailContent');
    var detailElements = taskDetailContent.querySelectorAll('input, select, textarea');
    const taskMemoContent = document.getElementById('taskMemo');
    let orderInCertainStatus = null;
    sessionStorage.setItem('ifLoggedIn', 'false');

    const loginModal = document.getElementById('loginModal');
    const logoutButton = document.getElementById('logoutButton');
    const closeBtn = document.getElementsByClassName('close')[0];
    const addUserModal = document.getElementById('addUserModal');

    const userInfoDiv = document.getElementById("user-info");

    search(); // index.html 함수
    const sessionUserName = sessionStorage.getItem("sessionUserName");
    const localUserName = localStorage.getItem("localUserName");
    const localPassword = localStorage.getItem("localPassword");
    const rememberMeCheckbox = document.getElementById("rememberMe");

    console.log("*localStorage:", localUserName);
    console.log("*sessionStorage:", sessionUserName);

    if (localUserName) {
        document.getElementById("username").value = localUserName;
        rememberMeCheckbox.checked = true;
    }
    if (localPassword) {
        document.getElementById("password").value = localPassword;
    }

    document.getElementById('loginForm').addEventListener('submit', function(event) {
        const rememberMeCheckbox = document.getElementById("rememberMe");
        if (rememberMeCheckbox.checked) {
            localStorage.setItem("localUserName", document.getElementById("username").value);
            localStorage.setItem("localPassword", document.getElementById("password").value);
        } else {
            localStorage.removeItem("localUserName");
            localStorage.removeItem("localPassword");
        }
    });

    if (sessionUserName !== null && sessionUserName !== '' && sessionUserName !== 'null') {
        loginModal.style.display = 'none';  // 로그인 상태: 모달 숨김
        logoutButton.style.display = 'inline';  // 로그인 상태: 로그아웃 버튼 표시
//        console.log("1 OO Logged in user:", sessionUserName);
    } else {
        loginModal.style.display = 'block'; // 로그아웃 상태: 모달 표시
        logoutButton.style.display = 'none';  // 로그아웃 상태: 로그아웃 버튼 숨김

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//        document.getElementById("username").value = 'admin';//////////////////////////////////////////////////////////////////////////////////
//        document.getElementById("password").value = 'admin';//////////////////////////////////////////////////////////////////////////////////
//        document.getElementById('loginSubmit').click();///////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//        console.log("2 XX Logged in user:", sessionUserName);
    }

    document.getElementById('addUser').addEventListener('click', function() {
        addUserModal.style.display = 'block';
    });
    document.querySelector('.close').addEventListener('click', () => {
        addUserModal.style.display = 'none';
    });
    document.getElementById('addUserForm').onsubmit = function(event) {
//        event.preventDefault(); // Prevent default form submission
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

    var tasksByWork = tasks.reduce((acc, task) => {
        const work = task.work_name; // 각 task의 day_of_week 속성 값 추출
        if (!acc[work]) { // 해당 요일에 대한 배열이 아직 존재하지 않으면
            acc[work] = []; // 새로운 배열을 생성
        }
        acc[work].push(task); // 해당 요일의 배열에 task를 추가
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
        return `${startMonthDay} ~ ${endMonthDay}`;
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
            workInputArea.style.display = 'flex';
        } else {
            workInputArea.style.display = 'none';
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
//            const items = categoriesList;
//            items.forEach(item => {
//                const navItem = createNavItem(item, category);
//                navItem.addEventListener('click', function() {
//                    setActiveNavItem(navItem);
//                    updateContent(category, item);
//                });
//                navigationBar.appendChild(navItem);
//            });
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

    function clickSideBar(selectedSide, clearDetail) {
        fetchMainTaskList();
        if(clearDetail){
            sessionStorage.setItem('detailID', '');
            clearTaskDetailContent();
        }
        orderInCertainStatus = null;

        switch (selectedSide) {
            case 'week':
//                fetchTasksByDateRange(); // Call this first
                if(sessionStorage.getItem('nav') === null || sessionStorage.getItem('nav') === ''){
                    fetchTasksByDateRange(); // 성공적으로 저장한 후 태스크 리스트를 새로 고침
                }else{
                    fetchTasksByDay();
                }
                renderDayTitlesList(); // Ensure days list is rendered first
                showForm();
                showDone();
                break;
            case 'onhold':
            case 'delegation':
            case 'plan':
                hideForm();
                showDone();
                break;
            case 'work':
                showForm();
                hideDone();
                break;
            case 'completed':
                hideForm();
                showDone();
                break;
            default:
                showForm();
                showDone();
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
        clickSideBar(selectedSide, true);
    });

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

    function showDone() {
        document.querySelector('.done-group').style.display = 'flex';
    }

    function hideDone() {
        document.querySelector('.done-group').style.display = 'none';
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
        putWorksToSelect();
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

    let originalValues = { // Variables to store the original values of the inputs
        taskName: '',
        categoryName: '',
        workName: '',
        dueDate: '',
        taskMemo: '',
        taskStatus: '',
        taskDone: ''
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
            const taskDoneSelect = document.getElementById('taskDone');
            const taskDoDate = document.getElementById('doDate');

            taskNameInput.value = task.task_content || '';
            originalValues.taskName = taskNameInput.value; // Store the original value

            categoryNameInput.value = task.category_name || '';
            originalValues.categoryName = categoryNameInput.value; // Store the original value

            //workNameInput.value = task.work_name || '';
            workNameInput.value = task.work_id;
            originalValues.workName = workNameInput.value; // Store the original value

            dueDateInput.value = task.due_date || '';
            originalValues.dueDate = dueDateInput.value; // Store the original value

            taskMemoInput.value = task.task_memo || '';
            originalValues.taskMemo = taskMemoInput.value; // Store the original value
            taskMemoInput.style.height = "auto"; // Reset height to auto to recalculate
            taskMemoInput.style.height = taskMemoContent.scrollHeight + "px"; // Set height based on the scrollHeight

            // Convert do_dates string to an array
            let doDatesArray = task.do_dates ? task.do_dates.split(',') : [];
            populateDoDates(doDatesArray);

            taskStatusSelect.value = task.task_status || '';
            originalValues.taskStatus = taskStatusSelect.value; // Store the original value

//            if(task_done !== null && task_done !== '') {
//            }
//console.log(">>",task.task_done);

            taskDoDate.innerText = task.do_date || '';  // p 태그의 텍스트를 do_date 값으로 설정
            console.log(task.do_date);
            taskDoneSelect.value = task.task_done || '';
            originalValues.taskDone = taskDoneSelect.value; // Store the original value

            taskNameInput.addEventListener('change', handleDetailChange);
            categoryNameInput.addEventListener('change', handleDetailChange);
            workNameInput.addEventListener('change', handleDetailChange);
            dueDateInput.addEventListener('change', handleDetailChange);
            taskMemoInput.addEventListener('change', handleDetailChange);
            taskStatusSelect.addEventListener('change', handleDetailChange);
            taskDoneSelect.addEventListener('change', handleDetailChange);
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
            case 'taskName':
            case 'categoryName':
            case 'workName':
            case 'dueDate':
            case 'taskMemo':
                currentValue = event.target.value;
                if (currentValue !== originalValues[id]) {
                    console.log('doneX currentValue: ',currentValue,' originalValues[id]: ', originalValues[id]);
                    saveChangesButton.click();
                }
                break;
            case 'taskDone':
                currentValue = event.target.value;
                if (currentValue !== originalValues[id]) {
                    console.log('doneO currentValue: ',currentValue,' originalValues[id]: ', originalValues[id]);
                    updateDoDateTaskDone();
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
                        updateDoDate(sessionStorage.getItem('detailID'), '9999-01-04', currentValue);
                    } else if(currentValue == 5) {
                        document.querySelector('.do-dates-group').style.display = 'none';
                        updateDoDate(sessionStorage.getItem('detailID'), '9999-01-05', currentValue);
                    } else if(currentValue == 6) {
                        document.querySelector('.do-dates-group').style.display = 'none';
                        updateDoDate(sessionStorage.getItem('detailID'), '9999-01-06', currentValue);
                    } else {
                        saveChangesButton.click();
                    }
                    if(currentValue == 2){
                        updateDoDateTaskDone('Done');
                    } else if (originalValues[id] == 2){
                        updateDoDateTaskDone('Undone');
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
            sessionStorage.setItem('detailDoDate', listItem.getAttribute('data-task-dodate'))
//            fromDay = fromId === 'taskList' ? 'NOTASSIGNED' : (fromId ? dayDateMap.get(fromId.replace('Tasks', '')) : 'NOTASSIGNED');
//            console.log('taskList detailID: '+sessionStorage.getItem('detailID'));
            fetchTaskDetails(listItem.getAttribute('data-task-dodate'));
        }
    });

    daysList.addEventListener('click', function(event) {
        const listItem = event.target.closest('li.task-item');
        if (listItem) {
            const taskId = listItem.getAttribute('data-task-id');
            sessionStorage.setItem('detailID', taskId);
            sessionStorage.setItem('detailDoDate', listItem.getAttribute('data-task-dodate'))
//            console.log('daysList detailID: '+sessionStorage.getItem('detailID'));
            fetchTaskDetails(listItem.getAttribute('data-task-dodate'));
        }
    });

    function updateDoDate(id, dates, status) {
//        console.log("0 id: ",id,'/dates:',dates,'/status:',status);
        const taskId = id ? id : sessionStorage.getItem('detailID');
        const datesString = dates ? dates : getDatesString();
        const taskStatus = status ? status : "";
        const updateData = {
            task_id: taskId,
            do_dates: datesString,
            task_status: taskStatus
        };
//        console.log("1 taskId: ",taskId,'/datesString:',datesString,'/taskStatus:',taskStatus);
        sessionStorage.setItem('detailID', taskId);

        const datesArray = datesString.split(',');  // Convert the datesString back to an array
        const lastDate = datesArray[datesArray.length - 1];  // Get the last date

        fetch('/api/updateDoDate', { // API 호출
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
//            if(sessionStorage.getItem('nav') === null || sessionStorage.getItem('nav') === ''){
//                fetchTasksByDateRange(); // 성공적으로 저장한 후 태스크 리스트를 새로 고침
//            }else{
//                fetchTasksByDay();
//            }
            fetchTaskDetails(lastDate); // 태스크 상세정보 갱신
//            fetchMainTaskList(); // 메인 태스크 리스트 갱신
            clickSideBar(selectedSide, false);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }


    function deleteDetailDoDate(taskId, doDate) {
//        const lastDate = datesArray[datesArray.length - 1];  // Get the last date
        console.log('taskId:',taskId,',doDate:',doDate);
        fetch(`/api/deleteDetailDoDate/${taskId}?doDate=${doDate}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            showNotification('Dodate deleted.', 'delete');

            // 날짜 배열을 수동으로 갱신
            let datesArray = getDatesString().split(',');  // 삭제 전 배열
            datesArray = datesArray.filter(date => date !== doDate); // 삭제된 날짜를 배열에서 제거

            if (!datesArray || datesArray.length === 0) {
                fetchTaskDetails(); // 태스크 상세정보 갱신
            } else {
                fetchTaskDetails(datesArray[datesArray.length - 1]); // 태스크 상세정보 갱신
            }
            clickSideBar(selectedSide, false);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }

    function updateDetailDoDate(id, oldDate, newDate) {
        const updateData = {
            task_id: id,
            old_do_date: oldDate,
            new_do_date: newDate
        };
        sessionStorage.setItem('detailID', id);

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
//            if(dates == null || dates == '') {
//                console.log("showNotification or not?? show!");
                showNotification('Do dates successfully updated!', 'success');
//            }
//            if(sessionStorage.getItem('nav') === null || sessionStorage.getItem('nav') === ''){
//                fetchTasksByDateRange(); // 성공적으로 저장한 후 태스크 리스트를 새로 고침
//            }else{
//                fetchTasksByDay();
//            }
            fetchTaskDetails(newDate); // 태스크 상세정보 갱신
//            fetchMainTaskList(); // 메인 태스크 리스트 갱신
            clickSideBar(selectedSide, false);
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
//            if(sessionStorage.getItem('nav') === null || sessionStorage.getItem('nav') === ''){
//                fetchTasksByDateRange(); // 성공적으로 저장한 후 태스크 리스트를 새로 고침
//            }else{
//                fetchTasksByDay();
//            }
//            fetchMainTaskList();
            fetchTaskDetails(toDay);
            clickSideBar(selectedSide, false);
        })
        .catch(error => console.error('Error updating task:', error));
    }

    // Initialize Sortable.js for a given task list element
    async function initSortable(taskListElement) {
        new Sortable(taskListElement, {
            group: 'shared',
            animation: 150,
            filter: '.empty-placeholder', // .empty-placeholder를 제외한 항목만 드래그할 수 있게 함
            handle: '.hamburger-icon', // Only allow dragging by the hamburger icon
            onStart: function (evt) {
                // 드래그 시작 시 복사본을 원래 위치에 저장
                evt.item.dataset.oldIndex = evt.oldIndex;
                evt.item.dataset.oldParent = evt.from.id;
            },
            onEnd: async function (evt) {  // onEnd 함수도 비동기로 선언
                const fromId = evt.from.id;
                const toId = evt.to.id;
                let fromDay;
                let toDay;

                if(selectedSide == 'work') {
//                    showNotification('Tasks in Work Menu cannot be moved!', 'error');
//                    clickSideBar('work');
//                    return;
                }
                if(orderInCertainStatus !== undefined && orderInCertainStatus !== null){
                    if(orderInCertainStatus == 2) {
                        showNotification('A completed task cannot be moved!', 'error');
                        console.log('orderInCertainStatus!=null orderInCertainStatus == 2!! return');
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

                const taskList = Array.from(evt.from.children).map(child => {
                    return {
                        task_id: child.getAttribute('data-task-id'),
                        task_order: parseInt(child.getAttribute('data-task-order'))
                    };
                });

                const movedTaskId = evt.item.getAttribute('data-task-id');  // The task ID of the moved task
//                const movedTaskDodate = evt.item.getAttribute('ata-task-dodate');
                const newIndex = evt.newIndex;
                const oldIndex = evt.oldIndex;

                if(fromDay == toDay && oldIndex == newIndex) return;
                const isDuplicate = await isDuplicateOnSameDate(toDay, movedTaskId);
                if(fromDay != toDay && isDuplicate) {

                    // 드래그한 아이템을 원래 위치로 되돌리기
                    const oldParent = document.getElementById(evt.item.dataset.oldParent);
                    const oldIndex = evt.item.dataset.oldIndex;
                    oldParent.insertBefore(evt.item, oldParent.children[oldIndex]);
                    showNotification('Same task exists on the same day', 'error');
                    return;
                }
                console.log('fromDay:', fromDay, '/toDay:', toDay,'/oldIndex:',oldIndex, '/newIndex:',newIndex,'/movedTaskId:',movedTaskId);
                await updateOrderAndDoDate(fromDay, toDay, oldIndex, newIndex, movedTaskId);
            }
        });
    }
    async function isDuplicateOnSameDate(day, id) {
        const taskId = id;
        const doDate = day;

        try {
            const response = await fetch(`/api/isDuplicateOnSameDate/${taskId}?doDate=${doDate}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            // API 결과 처리 (true or false)
            return data; // 서버에서 받은 데이터가 true/false로 반환된다고 가정
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
            return false; // 오류 발생 시 기본적으로 false 반환
        }
    }


    function renderDayTasksList(day) {
        const taskListForDay = document.getElementById(`${day}Tasks`);
        if (!taskListForDay) {
            console.error(`No element found with ID: ${day}Tasks`);
            return;
        }
        taskListForDay.innerHTML = '';

        if (tasksByDay[day] && tasksByDay[day].length > 0) {
            tasksByDay[day].forEach((task, index) => {
                const taskItem = createTaskItem(task, true, true);
                    if(task.is_overdue == '1'){
                        taskItem.id = 'overdue';
                    }
                taskListForDay.appendChild(taskItem);
            });
        } else taskListForDay.appendChild(addPlaceholderForEmptyList());
        initSortable(taskListForDay, null);
    }

    function renderWorkTasksList(workName) {
        const taskListForWork = document.getElementById(`${workName}Tasks`);
        if (!taskListForWork) {
            console.error(`No element found with ID: ${workName}Tasks`);
            return;
        }

        taskListForWork.innerHTML = '';

        // tasksByWork[workName]에서 tasks 배열을 가져와 작업을 렌더링
        const tasksForWork = tasksByWork[workName]?.tasks || [];

        if (tasksForWork.length > 0) {
            // task_id가 null이 아닌 task들만 필터링
            const filteredTasks = tasksForWork.filter(task => task.task_id !== null);

            if (filteredTasks.length > 0) {
                filteredTasks.forEach((task, index) => {
                    // 각 task를 렌더링
                    const taskItem = createTaskItem(task, false, false);
                    if(task.is_overdue == '1'){
                        taskItem.id = 'overdue';
                    }
                    taskListForWork.appendChild(taskItem);
                });
            } else taskListForWork.appendChild(addPlaceholderForEmptyList());
        } else taskListForWork.appendChild(addPlaceholderForEmptyList());

        initSortable(taskListForWork, null);  // 업데이트된 작업 목록에 대해 Sortable.js 초기화
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
                        if (data.length === 0) taskList.appendChild(addPlaceholderForEmptyList());
                        else {
                            data.forEach(task => {
                                const taskItem = createTaskItem(task, true, true);
                                if(task.is_overdue == '1'){
                                    taskItem.id = 'overdue';
                                }
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
                fetchTasksByWork();
                putWorksToSelect();
                break;
            default:
                break;
        }
    }

    function fetchTaskDetails(pDoDate) {
        const taskId = sessionStorage.getItem('detailID');
        var doDate = null;
//        console.log("pDoDate: ",pDoDate);
        if(pDoDate !== null && pDoDate !== ''){
            doDate = pDoDate === 'NOTASSIGNED' ? '9999-12-31' : pDoDate;
        }
        console.log("0fetchTaskDetails: ",taskId);

        if (!taskId) {
            clearTaskDetailContent();
            return; // 값이 없으므로 함수를 종료
        }

        fetch(`/api/findById/${taskId}?doDate=${doDate}`)
//        fetch(`/api/findById/${taskId}`)
            .then(response => {
//                console.log('Response status:', response.status); // 상태 코드 출력
                return response.text(); // 응답을 텍스트로 변환
            })
            .then(text => {
//                console.log('Response text:', text); // 응답 내용 출력
                if (text) {
                    try {
                        const data = JSON.parse(text); // Parse text as JSON
                        showTaskDetail(data);
                        if(data.task_status == 4 ||data.task_status == 5 ||data.task_status == 6){
//                            console.log('fetchTaskDetails status =456');
                            document.querySelector('.do-dates-group').style.display = 'none';
                        } else {
                            document.querySelector('.do-dates-group').style.display = 'flex';
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
        const taskDetailContent = document.getElementById('taskDetailContent');
        const inputs = taskDetailContent.querySelectorAll('input[type="text"], input[type="date"], textarea');
        inputs.forEach(input => {
            input.value = ''; // 입력 필드 값 초기화
        });

        const selects = taskDetailContent.querySelectorAll('select');
        selects.forEach(select => {
            select.selectedIndex = 0; // 기본 옵션으로 설정
        });

//        const radios = taskDetailContent.querySelectorAll('input[type="radio"]');
//        radios.forEach(radio => {
//            radio.checked = false; // 선택 해제
//        });
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

    function fetchTasksByWork() {
        fetch(`/api/tasksByWork`)
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
            // tasksByWork를 work_name을 키로 하고 work_id 및 tasks 배열을 포함하는 구조로 만듦
            tasksByWork = tasks.reduce((acc, task) => {
                const workName = task.work_name;
                const workId = task.work_id;

                if (!acc[workName]) {
                    acc[workName] = {
                        work_id: workId,
                        tasks: []
                    };
                }
                acc[workName].tasks.push(task);
                return acc;
            }, {});

            renderWorkTitlesList();
            Object.keys(tasksByWork).forEach(workName => renderWorkTasksList(workName));
//                renderWorkTasksList();
            })
            .catch(error => console.error('Error fetching tasks:', error));
    }

    function fetchStatus(pstat) {
//    console.log('fetchStatus(pstat)> ',pstat);
    const taskStatus = pstat;
    taskList.innerHTML = ''; // Clear current list
    fetch(`/api/findByStatus/${taskStatus}`)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                data.forEach(task => {
                    var taskItem;
                    if(pstat == 2) {
                        taskItem = createTaskItem(task, false, true);
                    } else {
                        taskItem = createTaskItem(task, true, true);
                    }
                    if(task.is_overdue == '1'){
                        taskItem.id = 'overdue';
                    }
                    taskList.appendChild(taskItem);
                });
            } else {
                taskList.appendChild(addPlaceholderForEmptyList());
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
                ul.id = `${day}Tasks`;

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
    // 워크 제목 만듦
    function renderWorkTitlesList() {
        daysList.innerHTML = '';

        Object.keys(tasksByWork).forEach(workName => {
//            const tasksForWork = tasksByWork[workName];
            const workId = tasksByWork[workName].work_id; // work_id 가져오기

            const ul = document.createElement('ul');
//            ul.id = `tasks_for_${workName.replace(/\s+/g, '_')}`; // Ensure ID is unique and valid
            ul.id = `${workName}Tasks`;

            const li = document.createElement('li');
            li.className = 'work-li';

            // Create the strong text element for workName
            const workTitle = document.createElement('p');
            workTitle.className = 'work-title';
            workTitle.innerHTML = `<strong>[[</strong> <strong class="custom-day-font">${workName}</strong> <strong>]]</strong>`;

            // Create the edit button
            const editBtn = document.createElement('span');
            editBtn.textContent = '✎';
            editBtn.className = 'work-edit-btn';
            editBtn.addEventListener('click', function(event) {
                event.stopPropagation();
                let promptMessage = 'Edit work:';
                const newName = prompt(promptMessage, workName);
                if (newName) {
                    saveWork(workId, newName);
                }
            });
            const deleteBtn = document.createElement('span');
            deleteBtn.textContent = '✖';
            deleteBtn.className = 'work-delete-btn';
            deleteBtn.addEventListener('click', function(event) {
                event.stopPropagation();
//                const confirmButton = document.getElementById('confirmDeleteButtonWork');
                document.getElementById('confirmDeleteButtonWork').setAttribute('data-work-id', workId);
//                document.getElementById('confirmDeleteButtonWork').setAttribute('data-work-name', workName);
                document.getElementById('deleteMessage').innerHTML = `Delete this work?<br>Tasks' work will be set to null.`;
                deleteConfirmationModalWork.style.display = 'block';
            });
            workTitle.appendChild(editBtn);
            workTitle.appendChild(deleteBtn);
            li.appendChild(workTitle);
//            li.appendChild(editBtn);
//            li.appendChild(deleteBtn);
            li.appendChild(ul); // Append the ul below the title and button
            daysList.appendChild(li);
        });
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
            if(selectedSide == 'work') {
                clickSideBar('work', true);
                putWorksToSelect();
                return;
            }
//            if(sessionStorage.getItem('nav') === null || sessionStorage.getItem('nav') === ''){
//                fetchTasksByDateRange(); // 성공적으로 저장한 후 태스크 리스트를 새로 고침
//            }else{
//                fetchTasksByDay();
//            }
//                fetchTasksAdded();
            fetchNewId();
            fetchTaskDetails(selectedDate);
            clickSideBar(selectedSide, false);
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
            work_id: document.getElementById('workName').value,
            due_date: document.getElementById('dueDate').value,
//            do_dates: datesString,
//            task_status: document.querySelector('input[name="status"]:checked').value,
            task_status: document.getElementById('taskStatus').value,
//            task_done: document.getElementById('taskDone').value,
//            do_date: sessionStorage.getItem('detailDoDate'),//........
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
//            if(sessionStorage.getItem('nav') === null || sessionStorage.getItem('nav') === ''){
//                fetchTasksByDateRange(); // 성공적으로 저장한 후 태스크 리스트를 새로 고침
//            }else{
//                fetchTasksByDay();
//            }
//            fetchMainTaskList();
            fetchTaskDetails(sessionStorage.getItem('detailDoDate'));
            clickSideBar(selectedSide, false);
        })
        .catch((error) => {
            console.error('Error:', error);
            // Handle error (e.g., show an error message)
        });
    });

    function updateDoDateTaskDone(param) {
        var doneValue = '';
        if(param == 'Done'){
            doneValue = 2;
        } else if(param == 'Undone'){
            doneValue = 1;
        } else doneValue = document.getElementById('taskDone').value;
        console.log("!!!!! updateDoDateTaskDone/doneValue: ",doneValue);
        const taskData = { // Collect form data
            task_done: doneValue,
            do_date: sessionStorage.getItem('detailDoDate'),//........
        };

        const idForDetail = sessionStorage.getItem('detailID');
        fetch(`/api/updateDoDateTaskDone/${idForDetail}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(taskData)
        })
        .then(response => response.json())
        .then(data => {
            showNotification('Successfully updated!', 'success');
            fetchTaskDetails(sessionStorage.getItem('detailDoDate'));
            clickSideBar(selectedSide, false);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }

    function saveWork(workId, newName) {
//        const workId = workId;
        const taskData = {
            work_name: newName
        };
        fetch(`/api/updateWork/${workId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(taskData)
        })
        .then(response => response.json())
        .then(data => {
            showNotification('Work updated!', 'success');
            clickSideBar('work', true);
        })
        .catch((error) => {
            console.error('Error:', error);
            // Handle error (e.g., show an error message)
        });
    }

    function deleteWork(workId) {
        // Send delete request to the server
        fetch(`/api/deleteWork/${workId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log('Deleted:', data);
            showNotification('Work deleted.', 'delete');
            clickSideBar('work', true);
            deleteConfirmationModalWork.style.display = 'none';
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }

    document.getElementById('deleteConfirmationButton').addEventListener('click', (event) => {
        event.preventDefault(); // Prevent the form from submitting the default way
        deleteConfirmationModal.style.display = 'block';
    });

//    document.getElementById('deleteConfirmationButtonWork').addEventListener('click', (event) => {
//        event.preventDefault(); // Prevent the form from submitting the default way
//        deleteConfirmationModalWork.style.display = 'block';
//    });

    document.getElementById('confirmDeleteButton').addEventListener('click', () => {
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
//                if(sessionStorage.getItem('nav') === null || sessionStorage.getItem('nav') === ''){
//                    fetchTasksByDateRange(); // 성공적으로 저장한 후 태스크 리스트를 새로 고침
//                }else{
//                    fetchTasksByDay();
//                }
//                fetchMainTaskList();

                clickSideBar(selectedSide, true);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
        }
    });
    document.getElementById('confirmDeleteButtonWork').addEventListener('click', () => {
        const workId = document.getElementById('confirmDeleteButtonWork').getAttribute('data-work-id');
        console.log("워크삭제, 아이디: ",workId);
        deleteWork(workId); // 실제 삭제 함수 호출
    });

    document.getElementById('cancelDeleteButton').addEventListener('click', () => {
        deleteConfirmationModal.style.display = 'none';
    });

    document.getElementById('cancelDeleteButtonWork').addEventListener('click', () => {
        deleteConfirmationModalWork.style.display = 'none';
    });

    // Close the delete confirmation modal when the user clicks anywhere outside of the modal
    window.addEventListener('click', (event) => {
        if (event.target === deleteConfirmationModal) {
            deleteConfirmationModal.style.display = 'none';
        }
        if (event.target === deleteConfirmationModalWork) {
            deleteConfirmationModalWork.style.display = 'none';
        }
    });

    function populateCategories() {
        fetch('/api/getCategories')
            .then(response => response.json())
            .then(categories => {
                categoriesList = categories; // 전역 변수에 저장
                const categorySelect = document.getElementById('categoryName');
                categorySelect.innerHTML = ''; // Clear any existing options

                // Create and append default option
                const defaultOption = document.createElement('option');
                defaultOption.value = '';
                /*defaultOption.textContent = 'Select a category';*/
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
                console.log("dateRemove! ",sessionStorage.getItem('detailID'),',',originalValue);
                deleteDetailDoDate(sessionStorage.getItem('detailID'), originalValue);
//                dateInputGroup.remove();
//                saveTaskData(); // Save changes when removing a date
//                updateDoDate();
            });

            dateInput.addEventListener('change', (event) => {
                if (event.target.value !== originalValue) {
                    console.log("dateAdd! ",sessionStorage.getItem('detailID'),',',originalValue,">>",event.target.value);
                    updateDetailDoDate(sessionStorage.getItem('detailID'), originalValue, event.target.value);
//                    saveTaskData(); // Call your function if the value has changed
//                    updateDoDate();
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
            console.log("dateRemove! ",sessionStorage.getItem('detailID'),',',originalValue);
            deleteDetailDoDate(sessionStorage.getItem('detailID'), originalValue);
            newDateInputGroup.remove(); // Remove the date group when the remove button is clicked
//            saveTaskData(); // Save changes when removing a date
//            updateDoDate();
        });

        newDateInput.addEventListener('change', (event) => {
            if (event.target.value !== originalValue) {
            console.log("dateAdd! ",sessionStorage.getItem('detailID'),',',originalValue,">>",event.target.value);
                updateDetailDoDate(sessionStorage.getItem('detailID'), originalValue, event.target.value);
//                    saveTaskData(); // Call your function if the value has changed
//                updateDoDate();
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
            clearTaskDetailContent();
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
//    function saveTaskData() {
//        // Programmatically trigger the click event on saveChangesButton
//        saveChangesButton.click();
//    }

    // Alternatively, if you need more control, use this:
    function calcHeight(textarea) {
        textarea.style.height = "auto"; // Reset height to auto to recalculate
        textarea.style.height = textarea.scrollHeight + "px"; // Set height based on the scrollHeight
    }

    taskMemoContent.addEventListener("input", () => {
        calcHeight(taskMemoContent);
    });

    function createTaskItem(task, hamburgerYN, workYN) {
        const li = document.createElement('li');
        li.className = 'task-item';
        li.setAttribute('data-task-id', task.task_id);

//        const checkbox = document.createElement('input');
//        checkbox.type = 'checkbox';
//        checkbox.checked = task.status === 'Completed';
//        checkbox.className = 'task-checkbox';

        const taskContainer = document.createElement('a'); // Use <a> to wrap all content
        taskContainer.className = 'task_content';

        const taskContentSpan = document.createElement('span');
        taskContentSpan.textContent = task.task_content;
        taskContentSpan.className = 'task_content';

        const workNameSpan = document.createElement('span');
        if(workYN) {
            workNameSpan.textContent = task.work_name;
            workNameSpan.className = 'work_name';
        } else {
            workNameSpan.textContent = '';
            workNameSpan.className = 'work_name';
        }

        const dueDateSpan = document.createElement('span');
        dueDateSpan.textContent = task.due_date;
        dueDateSpan.className = 'due_date';

//        console.log("0 task.do_date:",task.do_date);
        if(task.do_date){
//            console.log("1 task.do_date:",task.do_date);
            li.setAttribute('data-task-dodate', task.do_date);
        }

//        console.log("0 task.task_done:",task.task_done);
        const doneSpan = document.createElement('span');
        if(task.task_done == '1'){
            doneSpan.textContent = '';
        } else if(task.task_done == '2') {
            doneSpan.textContent = '[Done] ';
        } else if(task.task_done == '3') {
            doneSpan.textContent = '[Waiting] ';
        }
        doneSpan.className = 'task_done';

        taskContainer.appendChild(doneSpan);
        taskContainer.appendChild(taskContentSpan);
        taskContainer.appendChild(workNameSpan);
        taskContainer.appendChild(dueDateSpan);

        if (task.task_status == 2 || task.task_status == 3) { // completed or canceled
            taskContainer.classList.add('task-status-completed'); // Add custom class
        }

        const hamburgerIcon = document.createElement('span');
        if(hamburgerYN) {
            hamburgerIcon.className = 'hamburger-icon';
            hamburgerIcon.textContent = '☰'; // Using the Unicode character for hamburger icon
        } else {
            hamburgerIcon.className = 'non-hamburger-icon';
            hamburgerIcon.textContent = '▷'; // Using the Unicode character for hamburger icon
        }
        li.appendChild(hamburgerIcon);
        //li.appendChild(checkbox);
        li.appendChild(taskContainer);

        return li;
    }

    function putWorksToSelect() {
        console.log('putWorksToSelect');
        fetch('/api/works')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                const selectElement = document.getElementById('workName');

                // Clear existing options except for the placeholder
                selectElement.innerHTML = '<option value="" selected class="select-placeholder">Select a work</option>';

                /*const option = document.createElement('option');
                option.value = null;
                option.textContent = 'clear';
                selectElement.appendChild(option);*/
                data.forEach(work => {
                    const option = document.createElement('option');
                    option.value = work.work_id;
                    option.textContent = work.work_name;
                    selectElement.appendChild(option);
                });
            })
            .catch(error => console.error('Error fetching works:', error));
    }

    function addPlaceholderForEmptyList() {
        const emptyPlaceholder = document.createElement('li');
        emptyPlaceholder.className = 'empty-placeholder';
        emptyPlaceholder.textContent = 'No tasks available';
        emptyPlaceholder.style.pointerEvents = 'none'; // Prevent any interaction with the placeholder
        emptyPlaceholder.style.cursor = 'default';
        return emptyPlaceholder;
    }
});
