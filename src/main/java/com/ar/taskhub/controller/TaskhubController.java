package com.ar.taskhub.controller;

import com.ar.taskhub.dto.TaskhubDTO;
import com.ar.taskhub.service.TaskhubService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestMapping;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class TaskhubController {
    private static final Logger logger = LoggerFactory.getLogger(TaskhubController.class);
    private final TaskhubService taskhubService;
    private static final Map<String, String> DATE_MAP = new HashMap<>();

    @GetMapping("/save")
    public String save() {
        System.out.println(">>> TaskhubController.save 1");
        return "save";
    }

    @GetMapping("/tasksNotAssigned")
    public List<TaskhubDTO> getTasksNotAssigned() {
        return taskhubService.findAll();
    }

    @GetMapping("/findAssignedToMe")
    public List<TaskhubDTO> findAssignedToMe() {
        return taskhubService.findAssignedToMe();
    }

    @GetMapping("/findTaskContent/{taskId}")
    public TaskhubDTO findTaskContent(@PathVariable("taskId") String taskId) {
        return taskhubService.findTaskContent(taskId);
    }

    @PostMapping("/save")
    @ResponseBody
    public ResponseEntity<Map<String, String>> save(@RequestParam(value = "task_content", required = false) String taskContent,
                                                    @RequestParam(value = "work_name", required = false) String workName,
                                                    @RequestParam(value = "do_dates", required = false) String do_dates,
                                                    @RequestParam(value = "group_content", required = false) String groupContent,
                                                    @RequestParam(value = "routine_content", required = false) String routineContent,
                                                    @RequestParam("action") String action) {
        System.out.println(">>> TaskhubController.save 2 Action: " + action);

        if ("TASK".equals(action)) {
            taskhubService.insertTask(taskContent, do_dates, null);
            return createSuccessResponse("Task or Work saved successfully.");
        } else if ("WORK".equals(action)) {
            taskhubService.insertWork(workName);
            return createSuccessResponse("Task or Work saved successfully.");
        } else if ("GROUP".equals(action)) {
            taskhubService.insertRoutine(groupContent, null);
            return createSuccessResponse("Group saved successfully.");
        } else if ("ROUTINE".equals(action)) {
            try {
                taskhubService.insertRoutine(routineContent, "group");
                return createSuccessResponse("Routine saved successfully.");
            } catch (RuntimeException e) {
                // 에러 발생 시 간단한 메시지로 응답
                return ResponseEntity.badRequest().body(Map.of("message", e.getMessage())); // 메시지만 포함
            }
        } else {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid action"));
        }
    }

    private ResponseEntity<Map<String, String>> createSuccessResponse(String message) {
        return ResponseEntity.ok(Map.of("message", message)); // 성공 메시지만 포함
    }


    @PostMapping("/insertCategory")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> insertCategory(@RequestBody Map<String, String> categoryData) {
        String newCategoryName = categoryData.get("category_name");

        if (newCategoryName == null || newCategoryName.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("status", "error", "message", "Category name cannot be empty."));
        }

        try {
            taskhubService.insertCategory(newCategoryName);

            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Category added successfully.");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error while inserting category", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("status", "error", "message", "Failed to add category."));
        }
    }

    @PostMapping("/saveSubTask")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveSubTask(@RequestBody TaskhubDTO taskhubDTO) {
        taskhubService.saveSubTask(taskhubDTO);

        // Return a JSON response
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Task updated successfully.");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/tasks")
    public List<TaskhubDTO> getTasksByDateRange(@RequestParam(value = "baseDate", required = false) String baseDate) {
        return taskhubService.findByDoDates(baseDate);
    }

    @GetMapping("/tasksByCategory")
    public List<TaskhubDTO> getTasksByCategory(@RequestParam(value = "categoryId", required = false) String categoryId) {
        return taskhubService.findByCategory(categoryId);
    }

    @GetMapping("/tasksByWork")
    public List<TaskhubDTO> getAllTasks() {
        System.out.println("Fetching all tasks");
        return taskhubService.findByWork(null);
    }

    @GetMapping("/tasksByWork/{categoryId}")
    public List<TaskhubDTO> getTasksByWork(@PathVariable("categoryId") String categoryId) {
        System.out.println("findByWork cat id: " + categoryId);
        return taskhubService.findByWork(categoryId);
    }

    @GetMapping("/completedTasksByWork")
    public List<TaskhubDTO> getCompletedTasksByWork() {
        System.out.println("Fetching findCompletedTasksByWork");
        return taskhubService.findCompletedTasksByWork();
    }

    @GetMapping("/works/{categoryId}")
    public List<TaskhubDTO> getWorks(@PathVariable("categoryId") String categoryId) {
        System.out.println("getWorks cat id: " + categoryId);
        return taskhubService.findWorks(categoryId);
    }

    @GetMapping("/users")
    public List<TaskhubDTO> getUsers() {
        return taskhubService.findUsers();
    }

    @GetMapping("/findByStatus/{taskStatus}")
    public List<TaskhubDTO> getTasksByStatus(@PathVariable("taskStatus") String taskStatus) {
        return taskhubService.findByStatus(taskStatus);
    }

    @GetMapping("/tasksAdded")
    public List<TaskhubDTO> getTasks() {
        return taskhubService.findAll();
    }

    @GetMapping("/newId")
    public int findNewId() {
        return taskhubService.findNewId();
    }

    @GetMapping("/findById/{taskId}")
    public TaskhubDTO findById(@PathVariable("taskId") String taskId, @RequestParam("doDate") String doDate) {
//        System.out.println("[findById] taskId:"+taskId+",doDate:"+doDate+"///null equals?"+"null".equals(doDate));
        return taskhubService.findById(taskId, doDate);
    }

    @GetMapping("/findWorkById/{workId}")
    public TaskhubDTO findWorkById(@PathVariable("workId") String workId) {
//        System.out.println("[findWorkById] workId:"+workId+",doDate:"+doDate+"///null equals?"+"null".equals(doDate));
        return taskhubService.findWorkById(workId);
    }

    @GetMapping("/findRoutineById/{routineId}")
    public TaskhubDTO findRoutineById(@PathVariable("routineId") String routineId) {
        return taskhubService.findRoutineById(routineId);
    }

    @PostMapping("/updateTask/{taskId}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateTask(
            @PathVariable("taskId") String taskId,
            @RequestBody TaskhubDTO taskhubDTO) {
        System.out.println(">> Controller.updateTask taskid: " + taskId);
//        System.out.println(">> Controller.updateTask TaskhubDTO: " + taskhubDTO);

        // Set the task ID in the DTO and update the task
        taskhubDTO.setTask_id(taskId);
        taskhubService.updateTask(taskhubDTO);

        // Return a JSON response
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Task updated successfully.");

        return ResponseEntity.ok(response);
    }

    @PostMapping("/updateDoDateTaskDone/{taskId}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateDoDateTaskDone(
            @PathVariable("taskId") String taskId,
            @RequestBody TaskhubDTO taskhubDTO) {
        System.out.println(">>> TaskhubController.updateDoDateTaskDone taskid: " + taskId);
//        System.out.println("TaskhubDTO: " + taskhubDTO);

        // Set the task ID in the DTO and update the task
        taskhubDTO.setTask_id(taskId);
        taskhubService.updateDoDateTaskDone(taskhubDTO);

        // Return a JSON response
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "TaskDone updated successfully.");

        return ResponseEntity.ok(response);
    }

    @PostMapping("/updateWork/{workId}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateWork(
            @PathVariable("workId") String workId,
            @RequestBody TaskhubDTO taskhubDTO) {
        System.out.println(">>> TaskhubController.updateWork workId: " + workId);
//        System.out.println("TaskhubDTO: " + taskhubDTO);

        // Set the task ID in the DTO and update the task
        taskhubDTO.setWork_id(workId);
        taskhubService.updateWork(taskhubDTO);

        // Return a JSON response
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Task updated successfully.");

        return ResponseEntity.ok(response);
    }

    @PostMapping("/updateCategory/{categoryId}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateCategory(
            @PathVariable("categoryId") String categoryId,
            @RequestBody TaskhubDTO taskhubDTO) {
        System.out.println(">>> TaskhubController.updateCategory categoryId: " + categoryId);
//        System.out.println("TaskhubDTO: " + taskhubDTO);

        // Set the task ID in the DTO and update the task
        taskhubDTO.setCategory_id(Integer.valueOf(categoryId));
        taskhubService.updateCategory(taskhubDTO);

        // Return a JSON response
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Task updated successfully.");

        return ResponseEntity.ok(response);
    }

    @PostMapping("/updateRoutine/{routineId}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateRoutine(
            @PathVariable("routineId") String routineId,
            @RequestBody TaskhubDTO taskhubDTO) {
        System.out.println(">>> TaskhubController.updateRoutine routineId: " + routineId);
        System.out.println("TaskhubDTO: " + taskhubDTO);

        // Set the task ID in the DTO and update the task
        taskhubDTO.setRoutine_id(routineId);
        taskhubService.updateRoutine(taskhubDTO);

        // Return a JSON response
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Task updated successfully.");

        return ResponseEntity.ok(response);
    }

    @PostMapping("/clearParent/{taskId}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> clearParent(
            @PathVariable("taskId") String taskId) {
        System.out.println(">>> TaskhubController.clearParent taskId: " + taskId);
        taskhubService.clearParent(taskId);

        // Return a JSON response
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Task updated successfully.");

        return ResponseEntity.ok(response);
    }

    @PostMapping("/updateDoDates")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateDoDates(@RequestBody Map<String, Object> updateData) {
        String taskId = (String) updateData.get("task_id");
        String doDates = convertDate(getStringValue(updateData.get("do_dates")));
        String taskStatus = (String) updateData.get("task_status");

        TaskhubDTO taskhubDTO = new TaskhubDTO();
        taskhubDTO.setTask_id(taskId);
        taskhubDTO.setDo_dates(doDates);
        taskhubDTO.setTask_status(taskStatus);

        System.out.println(">>> updateDoDates taskId:" + taskId + " /doDates:" + doDates + " /taskStatus:" + taskStatus);
        taskhubService.updateDoDates(taskhubDTO);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Do dates successfully updated.");

        return ResponseEntity.ok(response);
    }

    @PostMapping("/updateDetailDoDate")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateDetailDoDate(@RequestBody Map<String, Object> updateData) {
        String taskId = (String) updateData.get("task_id");
        String oldDate = convertDate(getStringValue(updateData.get("old_do_date")));
        String newDate = convertDate(getStringValue(updateData.get("new_do_date")));

        TaskhubDTO taskhubDTO = new TaskhubDTO();
        taskhubDTO.setTask_id(taskId);
        taskhubDTO.setNew_do_date(newDate);
        taskhubDTO.setOld_do_date(oldDate);

        System.out.println(">>> updateDetailDoDate taskId:" + taskId + " /newDate:" + newDate + " /oldDate:" + oldDate);
        taskhubService.updateDetailDoDate(taskhubDTO);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Do dates successfully updated.");

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/deleteDetailDoDate/{taskId}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteDetailDoDate(
            @PathVariable("taskId") String taskId,
            @RequestParam("doDate") String doDate) {
        TaskhubDTO taskhubDTO = new TaskhubDTO();
        taskhubDTO.setTask_id(taskId);
        taskhubDTO.setDo_date(doDate);

        System.out.println(">>> deleteDetailDoDate taskId:" + taskId + " /doDate:" + doDate);
        taskhubService.deleteDetailDoDate(taskhubDTO);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Do dates successfully updated.");

        return ResponseEntity.ok(response);
    }

    static {
        DATE_MAP.put("NOTASSIGNED", "9999-12-31"); // 날짜 미할당 task
        DATE_MAP.put("4", "9999-01-04"); // task_status = "onhold"
        DATE_MAP.put("5", "9999-01-05"); // task_status = "delegation"
        DATE_MAP.put("6", "9999-01-06"); // task_status = "plan"
    }

    private static String convertDate(String date) {
        if (date == null) {
            return null;
        }
        return DATE_MAP.getOrDefault(date, date);
    }

    private static String getStringValue(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof String) {
            return (String) value;
        } else {
            return String.valueOf(value);
        }
    }

    @PostMapping("/updateOrderAndDoDate")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateOrderAndDoDate(@RequestBody Map<String, Object> updateData) {
        try {
            //updateOrderAndDoDate(fromDay, toDay,   oldIndex, newIndex, movedTaskId) {
            //updateOrderAndDoDate(null, '9999-01-04', null, null, sessionStorage.getItem('DetailID'));
            String taskId = (String) updateData.get("task_id");
            String oldDoDate = convertDate(getStringValue(updateData.get("old_do_date")));
            String newDoDate = convertDate(getStringValue(updateData.get("new_do_date")));
            String oldIdx = getStringValue(updateData.get("old_idx"));
            String newIdx = getStringValue(updateData.get("new_idx"));
            String taskStatus = (String) updateData.get("task_status");
            String taskDone = (String) updateData.get("task_done");

//            System.out.println("0 updateOrderAndDoDate task_id: " + taskId + " / taskStatus: " + taskStatus);
//            System.out.println("0 do_date: " + oldDoDate + "->" + newDoDate + " // idx: " + oldIdx + "->" + newIdx);

            //if (oldDoDate == null || oldIdx == null || newIdx == null) {
            if (oldDoDate == null || oldDoDate.isEmpty() || oldIdx == null || oldIdx.isEmpty() || newIdx == null || newIdx.isEmpty()) {
//                System.out.println("IF oldDoDate == null || oldIdx == null || newIdx == null ");
                Map<String, Object> oldValues = taskhubService.getOldDoDateAndOrder(taskId);
                newIdx = taskhubService.getMaxIdxOfNewDate(newDoDate);

                // Convert DO_DATE to String if it is a java.sql.Date
                Object oldDoDateObj = oldValues.get("old_do_date");
                if (oldDoDateObj instanceof Date) {
                    oldDoDate = ((Date) oldDoDateObj).toString(); // Convert to String in YYYY-MM-DD format
                } else {
                    oldDoDate = getStringValue(oldDoDateObj);
                }

                // Convert TASK_ORDER to String if it is an Integer
                Object oldOrderIdxObj = oldValues.get("old_order_idx");
                oldIdx = getStringValue(oldOrderIdxObj);
            }

            TaskhubDTO taskhubDTO = new TaskhubDTO();
            taskhubDTO.setTask_id(taskId);
            taskhubDTO.setOld_do_date(oldDoDate);
            taskhubDTO.setNew_do_date(newDoDate);
            taskhubDTO.setOld_order_idx(oldIdx);
            taskhubDTO.setNew_order_idx(newIdx);
            taskhubDTO.setTask_status(taskStatus);
            taskhubDTO.setTask_done(taskDone);
            System.out.println("updateOrderAndDoDate task_done: " + taskhubDTO.getTask_done());
//            System.out.println("1 do_date: " + taskhubDTO.getOld_do_date() + "->" + taskhubDTO.getNew_do_date() + " // idx: " + taskhubDTO.getOld_order_idx() + "->" + taskhubDTO.getNew_order_idx());

            taskhubService.updateOrderAndDoDate(taskhubDTO);

            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Task order and due date updated successfully.");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            // Prepare and return error response
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "error");
            errorResponse.put("message", "Failed to update task: " + e.getMessage());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @DeleteMapping("/deleteTask/{taskId}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteTask(@PathVariable("taskId") String taskId) {
        System.out.println(">>> TaskhubController.deleteTask Task ID: " + taskId);
        try {
            // Call the service layer to delete the task
            taskhubService.deleteTask(taskId);

            // Return a JSON response
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Task deleted successfully.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            // Handle error (e.g., task not found)
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", "Failed to delete task. Task might not exist.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @DeleteMapping("/deleteWork/{workId}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteWork(@PathVariable("workId") String workId) {
        System.out.println(">>> TaskhubController.deleteWork Work ID: " + workId);
        try {
            // Call the service layer to delete the task
            taskhubService.deleteWork(workId);

            // Return a JSON response
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Work deleted successfully.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            // Handle error (e.g., task not found)
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", "Failed to delete work. Work might not exist.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @DeleteMapping("/deleteCategory/{categoryId}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteCategory(@PathVariable("categoryId") String categoryId) {
        System.out.println(">>> TaskhubController.deleteCategory Category ID: " + categoryId);
        try {
            // Call the service layer to delete the task
            taskhubService.deleteCategory(categoryId);

            // Return a JSON response
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Category deleted successfully.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            // Handle error (e.g., task not found)
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", "Failed to delete category. Category might not exist.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/getCategories")
    public List<TaskhubDTO> getCategories() {
        return taskhubService.getCategories();
    }

    @GetMapping("/isDuplicateOnSameDate/{taskId}")
    public ResponseEntity<Boolean> chkDuplicateOnSameDate(
            @PathVariable("taskId") String taskId,
            @RequestParam("doDate") String doDate) {
        String newDoDate = convertDate(doDate);
        boolean isDuplicate = taskhubService.isDuplicateOnSameDate(taskId, newDoDate);
        return ResponseEntity.ok(isDuplicate);
    }

    @GetMapping("/isEveryTaskCompleted/{workId}")
    public ResponseEntity<Boolean> isEveryTaskCompleted(
            @PathVariable("workId") String workId) {
        boolean isCompleted = taskhubService.isEveryTaskCompleted(Long.valueOf(workId));
        return ResponseEntity.ok(isCompleted);
    }

    @GetMapping("/findRoutines")
    public List<TaskhubDTO> findRoutines() {
        return taskhubService.findRoutines();
    }
}