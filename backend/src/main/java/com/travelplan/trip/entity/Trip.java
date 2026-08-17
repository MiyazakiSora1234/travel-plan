package com.travelplan.trip.entity;

import com.travelplan.trip.TripConstraints;
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

// API入出力には使わずDTOを介する。公開Setterは持たず、更新は#updateのみで行う。
@Entity
@Table(name = "trips")
@Getter
@NoArgsConstructor
public class Trip {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, length = TripConstraints.NAME_MAX_LENGTH)
    private String name;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "memo", length = TripConstraints.MEMO_MAX_LENGTH)
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
