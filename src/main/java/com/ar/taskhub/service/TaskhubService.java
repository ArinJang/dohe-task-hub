package com.ar.taskhub.service;

import com.ar.taskhub.dto.TaskhubDTO;
import com.ar.taskhub.repository.TaskhubRepository;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataAccessException;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class TaskhubService {

    private final TaskhubRepository taskhubRepository;
    private final HttpSession session;

    public TaskhubDTO getLoginIdDTO() {
        TaskhubDTO newDTO = new TaskhubDTO();
        newDTO.setUser_id((Long) session.getAttribute("sessionUserId"));
        return newDTO;
    }

    @Transactional
    public void insertTask(String taskContent, String do_dates, String parent_task_id) {
        TaskhubDTO taskDTO = getLoginIdDTO();  // DTO는 요청마다 새로 생성
        if(taskContent != null) taskDTO.setTask_content(taskContent);
        if(do_dates == null || do_dates.isEmpty()) {
            taskDTO.setDo_dates("9999-12-31");
        } else {
            taskDTO.setDo_dates(do_dates);
        }
        taskDTO.setParent_task_id(parent_task_id);
        taskhubRepository.callInsertTaskAndDoDates(taskDTO);
    }

    public void insertWork(String workName) {
        TaskhubDTO taskDTO = getLoginIdDTO();
        if(workName != null) taskDTO.setWork_name(workName);
        taskhubRepository.insertWork(taskDTO);
    }

    public List<TaskhubDTO> findAll(){
//        System.out.println("service findAll(Long defaultId)? "+getLoginIdDTO().getUser_id());
        Long user_id = getLoginIdDTO().getUser_id() == null ? 2 : getLoginIdDTO().getUser_id();
        return taskhubRepository.findAll(user_id);
    }

    public List<TaskhubDTO> findAssignedToMe(){
//        System.out.println("service findAssignedToMe(Long defaultId)? "+getLoginIdDTO().getUser_id());
        Long user_id = getLoginIdDTO().getUser_id() == null ? 2 : getLoginIdDTO().getUser_id();
        List<TaskhubDTO> dto = taskhubRepository.findAssignedToMe(user_id);
//        System.out.println("dto:::"+dto);
        return dto;
    }

    public TaskhubDTO findTaskContent(String task_id){
//        System.out.println("findTaskContent:::: "+task_id);
//        TaskhubDTO dto = taskhubRepository.findTaskContent(Long.valueOf(task_id));
//        System.out.println("dto:::"+dto);
        return taskhubRepository.findTaskContent(Long.valueOf(task_id));
    }

    public List<TaskhubDTO> findByDoDates(String baseDate) {
        LocalDate today;
        if (baseDate != null && !baseDate.isEmpty()) {
            today = LocalDate.parse(baseDate); // 문자열을 LocalDate로 변환
//            System.out.println("baseDate passed::: "+baseDate);
//            System.out.println("baseDate parsed::: "+today);
        } else {
            today = LocalDate.now(); // baseDate가 없으면 현재 날짜를 사용
//            System.out.println("baseDate is null");
        }
        LocalDate monday = getMonday(today);
        LocalDate sunday = getSunday(today);
        String mon = formatDate(monday);
        String sun = formatDate(sunday);

        TaskhubDTO taskDTO;
        if(getLoginIdDTO().getUser_id() == null) {
            taskDTO = new TaskhubDTO();
            taskDTO.setUser_id(2L);
        } else {
            taskDTO = getLoginIdDTO();
        }
        taskDTO.setMon(mon);
        taskDTO.setSun(sun);
        return taskhubRepository.findByDoDates(taskDTO);
    }

    public List<TaskhubDTO> findByWork() {
        return taskhubRepository.findByWork(getLoginIdDTO().getUser_id());
    }

    public List<TaskhubDTO> findWorks() {
        return taskhubRepository.findWorks(getLoginIdDTO().getUser_id());
    }

    public List<TaskhubDTO> findUsers() {
        return taskhubRepository.findUsers(getLoginIdDTO().getUser_id());
    }

    // 현재 날짜를 기준으로 해당 주의 월요일 날짜를 구하는 메소드
    public static LocalDate getMonday(LocalDate date) {
        return date.with(DayOfWeek.MONDAY);
    }

    // 현재 날짜를 기준으로 해당 주의 일요일 날짜를 구하는 메소드
    public static LocalDate getSunday(LocalDate date) {
        return date.with(DayOfWeek.SUNDAY);
    }
    // 날짜를 문자열로 포맷하는 메소드
    public static String formatDate(LocalDate date) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        return date.format(formatter);
    }

    public TaskhubDTO findById(String taskId, String doDate) {
        Map<String, Object> params = new HashMap<>();
        params.put("task_id", taskId);
        if (doDate == null || doDate.isEmpty() || "undefined".equals(doDate) || "null".equals(doDate)) {
            doDate = taskhubRepository.findLatestDoDateById(Long.valueOf(taskId));
        System.out.println("doDate findLatestDoDateById :"+doDate);
        }
//        if(doDate == null || doDate.isEmpty()) {
//            params.put("do_date", "9999-12-31");
//        } else {
//            params.put("do_date", doDate);
//        }
        params.put("do_date", doDate);
        params.put("user_id", getLoginIdDTO().getUser_id());
//        System.out.println("0 taskId:"+taskId+",doDate:"+doDate+"???"+"null".equals(doDate)+"///"+(doDate==null));
        return taskhubRepository.findById(params);
    }

    public int findNewId() {
        return taskhubRepository.findNewId(getLoginIdDTO().getUser_id());
    }

    public void updateTask(TaskhubDTO taskDTO) {
        System.out.println("task modify, not done!! task_id:"+taskDTO.getTask_id()+"/do_date:"+taskDTO.getDo_date()+",task_done:"+taskDTO.getTask_done());
        taskhubRepository.updateTask(taskDTO);
    }

    public void saveSubTask(TaskhubDTO taskDTO) {
        System.out.println("sub task!! task_content:"+taskDTO.getTask_content()+"/parent_task_id:"+taskDTO.getParent_task_id());
        insertTask(taskDTO.getTask_content(), taskDTO.getDo_date(), taskDTO.getParent_task_id());
    }

    public void updateDoDateTaskDone(TaskhubDTO taskDTO) {
        System.out.println("only done modify!! task_id:"+taskDTO.getTask_id()+"/do_date:"+taskDTO.getDo_date()+",task_done:"+taskDTO.getTask_done());
        Map<String, Object> params = new HashMap<>();
        params.put("task_id", taskDTO.getTask_id());
        params.put("do_date", taskDTO.getDo_date());
        params.put("task_done", taskDTO.getTask_done());
        taskhubRepository.updateDoDateTaskDone(params);
    }

    public void updateWork(TaskhubDTO taskDTO) {
        taskhubRepository.updateWork(taskDTO);
    }

    public void clearParent(String taskId) {
        taskhubRepository.clearParent(Long.valueOf(taskId));
    }

    @Transactional
    public void deleteTask(String taskId) {
        System.out.println("service delete: "+taskId);
        System.out.println("Starting assignTempOrderById...");
        taskhubRepository.assignTempOrderById(taskId);
        System.out.println("Starting rearrangeOrderById...");
        Map<String, Object> params = new HashMap<>();
        params.put("task_id", taskId);
        params.put("user_id", getLoginIdDTO().getUser_id());
        taskhubRepository.rearrangeOrderById(params);
        System.out.println("Starting deleteTask...");
        taskhubRepository.deleteTask(taskId);
        System.out.println("delete end...");
    }

    @Transactional
    public void deleteWork(String workId) {
        System.out.println("service delete: "+workId);
        System.out.println("Starting updateTaskDeletingWorkId...");
        Long work_id = Long.valueOf(workId);
        taskhubRepository.updateTaskDeletingWorkId(work_id);
        System.out.println("Starting updateTaskDeletingWorkId...");
        Map<String, Object> params = new HashMap<>();
        params.put("work_id", workId);
        params.put("user_id", getLoginIdDTO().getUser_id());
        System.out.println("Starting deleteWork...");
        taskhubRepository.deleteWork(params);
        System.out.println("delete end...");
    }

    public List<TaskhubDTO> getCategories() {
        return taskhubRepository.getCategories(getLoginIdDTO().getUser_id());
    }

    public List<TaskhubDTO> findByStatus(String taskStatus) {
        Map<String, Object> params = new HashMap<>();
        params.put("task_status", taskStatus);
        params.put("user_id", getLoginIdDTO().getUser_id());
        return taskhubRepository.findByStatus(params);
    }

    @Transactional
    public void updateOrderAndDoDate(TaskhubDTO taskDTO) {
        System.out.println("! updateOrderAndDoDate");
        try {
            String taskId = taskDTO.getTask_id();
            if(taskDTO.getTask_status() != null) {
                System.out.println("taskDTO.getTask_status() != null");
                Map<String, Object> params = new HashMap<>();
                params.put("task_status", taskDTO.getTask_status());
                params.put("task_id", taskId);
                taskhubRepository.updateStatus(params);
            }

            taskDTO.setUser_id(getLoginIdDTO().getUser_id());
            // case1: 이동하는 날짜그룹 상이
            if(!Objects.equals(taskDTO.getNew_do_date(), taskDTO.getOld_do_date())) {
                if(Objects.equals(taskDTO.getNew_do_date(), "9999-12-31")){
                    taskhubRepository.assignTempOrderById(taskId);

                    Map<String, Object> params = new HashMap<>();
                    params.put("task_id", taskId);
                    params.put("user_id", getLoginIdDTO().getUser_id());
                    taskhubRepository.rearrangeOrderById(params); // 해당 taskId가 들어간 모든 dodate들의 항목을 해당 태스크를 제외한 채 재정렬
                    params.put("do_date", taskDTO.getOld_do_date());
                    String taskDone = taskhubRepository.isDone(params);

                    taskhubRepository.deleteDoDatesByTaskId(taskId); // 기존 DODATES 삭제

                    // Update new DO_DATE TASK_ORDER
                    System.out.println(taskDTO.getNew_do_date()+"/"+taskDTO.getNew_order_idx());
                    taskhubRepository.orderPlus1BeforeInsertion(taskDTO);

                    String taskOrder = taskDTO.getNew_order_idx();

                    Map<String, Object> params3 = new HashMap<>();
                    params3.put("task_id", taskId);
                    params3.put("do_date", taskDTO.getNew_do_date());
                    params3.put("task_order", taskOrder);
                    params3.put("task_done", taskDone);
                    System.out.println("!!!"+params3);
                    taskhubRepository.insertDoDate(params3);
                    return;
                }

                // 1. Update old DO_DATE TASK_ORDER
//                System.out.println("Updating different day, old DO_DATE TASK_ORDER...");
                taskhubRepository.orderMinus1BeforeDeletion(taskDTO);
//                System.out.println("Updated different day, old DO_DATE TASK_ORDER.");

                // 2. Update new DO_DATE TASK_ORDER
//                System.out.println("Updating different day, new DO_DATE TASK_ORDER...");
                taskhubRepository.orderPlus1BeforeInsertion(taskDTO);
//                System.out.println("Updated different day, new DO_DATE TASK_ORDER.");

                // 3. Update TASK_ID with new DO_DATE and TASK_ORDER
//                System.out.println("Updating different day, task_id's date and order...");
                taskhubRepository.updateOrderAndDoDateOfTask(taskDTO);
//                System.out.println("Updated different day, task_id's date and order.");
            } else { // case2: 이동하는 날짜그룹 동일
                // case2-1: Moving Downwards
                if(Integer.parseInt(taskDTO.getOld_order_idx()) < Integer.parseInt(taskDTO.getNew_order_idx())){
//                    System.out.println("Updating same day, downwards...");
                    taskhubRepository.updateOrderAndDoDateInSameDateDown(taskDTO);
//                    System.out.println("Updated same day, downwards.");
                } else { // case2-2: Moving Upwards
//                    System.out.println("Updating same day, upwards...");
                    taskhubRepository.updateOrderAndDoDateInSameDateUp(taskDTO);
//                    System.out.println("Updated same day, upwards.");
                }
                // Update TASK_ID with new DO_DATE and TASK_ORDER
//                System.out.println("Updating same day, task_id's date and order...");
                taskhubRepository.updateOrderAndDoDateOfTask(taskDTO);
//                System.out.println("Updated same day, task_id's date and order.");
            }

        } catch (DataAccessException e) {
            System.err.println("Failed to update task order and due date: " + e.getMessage());
            throw new RuntimeException("Failed to update task order and due date", e);
        }
    }

    @Transactional
    @Scheduled(cron = "0 0 0 * * *") // 매일 자정에 실행
//    @Scheduled(cron = "0 8 3 * * ?")
    public void insertUncompletedTaskToToday() {
        System.out.println("----------------Scheduled task insertUncompletedTaskToToday");
        System.out.println("Scheduled task started at: " + LocalDateTime.now());
//        System.out.println("!!!!!!!!!! insertUncompletedTaskToToday <<<");
        LocalDate now = LocalDate.now(); // 오늘 날짜 가져오기
        String today = formatDate(now);

        // 이미 오늘 실행했는지 체크
        boolean isExecutedToday = taskhubRepository.isTaskExecutedToday(today);
//        System.out.println("isExecutedToday:  "+isExecutedToday);
        if (!isExecutedToday) {
            List<Long> userIds = taskhubRepository.findAllUsers();
            for(Long user_id : userIds){
//                if(user_id == 1) {
//                    System.out.println("THIS IS USER 1. PASS!!");
//                    continue;
//                }
                System.out.println("user_id: " + user_id);

                // [case1] 태스크 이동 : complete/cancel이 아니고 Done도 아닌 태스크 -> 최신 두데잇 삭제 후 현재일 두데잇으로 인서트
                List<TaskhubDTO> taskIdsAndDodate = taskhubRepository.findUncompletedUndone(user_id);

                for (TaskhubDTO idDate : taskIdsAndDodate) {
                    Map<String, Object> params = new HashMap<>();
                    params.put("task_id", idDate.getTask_id());
                    params.put("user_id", user_id);
                    params.put("do_date", idDate.getDo_date());
//                    System.out.println("1 Starting assignTempOrderByIdDate...");
                    taskhubRepository.assignTempOrderByIdDate(params);

//                    System.out.println("2 Starting rearrangeOrderByIdDate...");
                    taskhubRepository.rearrangeOrderByIdDate(params); // 해당 taskId와 MAX(dodate) 날짜의 항목을 해당 태스크를 제외한 채 재정렬

//                    System.out.println("3 Starting deleteDoDatesByTaskId2...");
                    taskhubRepository.deleteDoDatesByTaskId2(params); // 기존 DODATES 삭제
//                    System.out.println("4 deleteDoDatesByTaskId2 end...");

                    Map<String, Object> params2 = new HashMap<>();
                    params2.put("do_date", today);
                    params2.put("user_id", user_id);
                    int taskOrder = taskhubRepository.getMaxTaskOrder(params2);
                    System.out.println("             taskIds: " + idDate.getTask_id()+" /taskOrder: " + taskOrder);

                    Map<String, Object> params3 = new HashMap<>();
                    params3.put("task_id", idDate.getTask_id());
                    params3.put("do_date", today);
                    params3.put("task_order", taskOrder);
                    taskhubRepository.insertDoDate(params3);
                    System.out.println("                          param3::: " + params3);
                }
                    System.out.println("case 1 end, case 2 start");

                // [case2] 태스크 복제 : complete/cancel이 아니고 Done인 태스크 -> only 현재일 두데잇으로 인서트
                List<String> taskIds2 = taskhubRepository.findUncompletedDone(user_id);

                for (String task_id : taskIds2) {
                    Map<String, Object> params2 = new HashMap<>();
                    params2.put("do_date", today);
                    params2.put("user_id", user_id);
                    int taskOrder = taskhubRepository.getMaxTaskOrder(params2);
                    System.out.println("             taskIds: " + task_id+" /taskOrder: " + taskOrder);

                    Map<String, Object> params3 = new HashMap<>();
                    params3.put("task_id", task_id);
                    params3.put("do_date", today);
                    params3.put("task_order", taskOrder);
                    taskhubRepository.insertDoDate(params3);
                    System.out.println("                          param3::: " + params3);
                }
            }
            // 실행 기록 저장
            taskhubRepository.saveExecutionLog(today);
        } else {
            System.out.println("오늘 이미 실행됨");
        }
    }

    @Transactional
    public void updateDoDates(TaskhubDTO taskDTO) {
//        System.out.println("updateDoDates doDates:: "+doDates);
        String[] dateArray;
        String taskId = taskDTO.getTask_id();
        String doDates = taskDTO.getDo_dates();
        String taskStatus = taskDTO.getTask_status();
        if (doDates == null || doDates.trim().isEmpty()) {
            dateArray = new String[] { "9999-12-31" };
            taskStatus = "";
        } else {
            dateArray = doDates.split(",");
        }
        System.out.println("1 Starting assignTempOrderById...");
        taskhubRepository.assignTempOrderById(taskId);

//        System.out.println("2 Starting rearrangeOrderById...");
        Map<String, Object> params = new HashMap<>();
        params.put("task_id", taskId);
        params.put("user_id", getLoginIdDTO().getUser_id());
        taskhubRepository.rearrangeOrderById(params); // 해당 taskId가 들어간 모든 dodate들의 항목을 해당 태스크를 제외한 채 재정렬

//        System.out.println("3 Starting deleteDoDatesByTaskId...");
        taskhubRepository.deleteDoDatesByTaskId(taskId); // 기존 DODATES 삭제
//        System.out.println("4 deleteDoDatesByTaskId end...");

        for (String date : dateArray) {
            // TASK_ORDER 값을 계산하기 위한 로직 추가
            Map<String, Object> params2 = new HashMap<>();
            params2.put("do_date", date);
            params2.put("user_id", getLoginIdDTO().getUser_id());
            int taskOrder = taskhubRepository.getMaxTaskOrder(params2);
//            System.out.println("updateDoDates taskOrder:: "+taskOrder+" / date: "+date);
            // 각 날짜를 DODATES 테이블에 삽입
            Map<String, Object> params3 = new HashMap<>();
            params3.put("task_id", taskId);
            params3.put("do_date", date.trim());
            params3.put("task_order", taskOrder);
            taskhubRepository.insertDoDate(params3);
        }
        if(taskStatus != null && !taskStatus.isEmpty()) {
//            System.out.println("5 Starting updateStatus..."+taskStatus);
            Map<String, Object> params4 = new HashMap<>();
            params4.put("task_status", taskDTO.getTask_status());
            params4.put("task_id", taskDTO.getTask_id());
            taskhubRepository.updateStatus(params4);
//            System.out.println("5 updateStatus end.");
        }
    }

    @Transactional
    public void updateDetailDoDate(TaskhubDTO taskDTO) {
        System.out.println("updateDetailDoDate dto:"+taskDTO);
        if(taskDTO.getOld_do_date() != null && !taskDTO.getOld_do_date().isEmpty()) {
            Map<String, Object> params = new HashMap<>();
            params.put("task_id", taskDTO.getTask_id());
            params.put("user_id", getLoginIdDTO().getUser_id());
            params.put("do_date", taskDTO.getOld_do_date());
            System.out.println("updateDetailDoDate params: "+params);
            taskhubRepository.assignTempOrderByIdDate(params);
//        taskhubRepository.assignTempOrderById(taskDTO.getTask_id());

//            Map<String, Object> params1 = new HashMap<>();
//            params1.put("task_id", taskDTO.getTask_id());
//            params1.put("user_id", getLoginIdDTO().getUser_id());
//            params1.put("do_date", taskDTO.getOld_do_date());
            taskhubRepository.rearrangeOrderByIdDate(params); // 해당 taskId, dodate의 항목을 해당 태스크를 제외한 채 재정렬
        }

        Map<String, Object> params2 = new HashMap<>();
        params2.put("user_id", getLoginIdDTO().getUser_id());
        params2.put("do_date", taskDTO.getNew_do_date());
        int taskOrder = taskhubRepository.getMaxTaskOrder(params2);

        Map<String, Object> params3 = new HashMap<>();
        params3.put("task_id", taskDTO.getTask_id());
        params3.put("do_date", taskDTO.getNew_do_date());
        params3.put("task_order", taskOrder);
        if(taskDTO.getOld_do_date() != null && !taskDTO.getOld_do_date().isEmpty()) {
            params3.put("old_date", taskDTO.getOld_do_date());
            taskhubRepository.updateDetailDoDate(params3);
        } else {
            taskhubRepository.insertDoDate(params3);
        }
    }


    @Transactional
    public void deleteDetailDoDate(TaskhubDTO taskDTO) {
        if(taskhubRepository.isOnlyDoDate(taskDTO.getTask_id()) <= 1) {

//            Map<String, Object> params = new HashMap<>();
//            params.put("task_id", taskDTO.getTask_id());
//            params.put("user_id", getLoginIdDTO().getUser_id());
//            String taskDone = taskhubRepository.isDone(params);

            taskDTO.setOld_do_date(taskDTO.getDo_date());
            taskDTO.setNew_do_date("9999-12-31");
//            System.out.println("cnt:"+taskhubRepository.isOnlyDoDate(taskDTO.getTask_id()));
            updateDetailDoDate(taskDTO);
            return;
        }
        Map<String, Object> params = new HashMap<>();
        params.put("task_id", taskDTO.getTask_id());
        params.put("user_id", getLoginIdDTO().getUser_id());
        params.put("do_date", taskDTO.getDo_date());

        taskhubRepository.assignTempOrderByIdDate(params);
        taskhubRepository.rearrangeOrderByIdDate(params);
        taskhubRepository.deleteDoDatesByTaskId2(params); // 기존 DODATES 삭제
    }


    public Map<String, Object> getOldDoDateAndOrder(String taskId) {
        return taskhubRepository.getOldDoDateAndOrder(taskId);
    }

    public String getMaxIdxOfNewDate(String newDoDate) {
        Map<String, Object> params = new HashMap<>();
        params.put("newDoDate", newDoDate);
        params.put("user_id", getLoginIdDTO().getUser_id());
        return taskhubRepository.getMaxIdxOfNewDate(params);
    }

    // 특정 날짜에 동일한 사용자의 중복 작업이 있는지 확인하는 메서드
    public boolean isDuplicateOnSameDate(String taskId, String doDate) {
        Map<String, Object> params = new HashMap<>();
        params.put("task_id", taskId);
//        if (Objects.equals(doDate, "NOTASSIGNED")) doDate = "9999-12-31";
        params.put("do_date", doDate);

        int count = taskhubRepository.isDuplicateOnSameDate(params);
        return count > 0;
    }

}
