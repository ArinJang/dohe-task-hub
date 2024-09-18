package com.ar.taskhub.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class TaskhubDTO {
    private Long user_id;

    //task 테이블
    private String task_id;
    private String task_content;
    private String task_status;
    private String task_order;
    private String task_order_idx;
    private String new_order_idx;
    private String old_order_idx;
    private String due_date;
    private String do_dates;
    private String new_do_date;
    private String old_do_date;
    private String create_date;
    private String task_memo;
    private String assignee_id;
    private String work_id;
    private String writer_id;
    private String user_name;
    private String work_name;
    private String work_memo;
    private String work_date;
    private String is_overdue;

    private Integer category_id;
    private String category_name;
    private Integer category_order;

    private String day_of_week; // 요일 정보 추가

    private String mon;
    private String sun;

    private String do_date;
    private String ori_do_date;
    private String task_done;

}
