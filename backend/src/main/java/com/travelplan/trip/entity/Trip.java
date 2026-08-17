package com.travelplan.trip.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

/**
 * 旅行計画の永続化モデル。API入出力にはこのクラスを直接使わず、必ずDTOを介する。
 * 不用意な書き換えを防ぐため汎用的な公開Setterは持たず、更新は{@link #update}のみで行う。
 * JPAは{@code @Id}がフィールドにあるためフィールドアクセス（リフレクション）で永続化・更新が
 * 行われ、Setter無しでも動作する。
 */
@Entity
@Table(name = "trips")
@Getter
@NoArgsConstructor
public class Trip {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "memo", length = 2000)
    private String memo;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    public Trip(String name, LocalDate startDate, LocalDate endDate, String memo) {
        this.name = name;
        this.startDate = startDate;
        this.endDate = endDate;
        this.memo = memo;
    }

    public void update(String name, LocalDate startDate, LocalDate endDate, String memo) {
        this.name = name;
        this.startDate = startDate;
        this.endDate = endDate;
        this.memo = memo;
    }
}
