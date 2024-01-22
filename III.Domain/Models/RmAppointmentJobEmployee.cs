using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace ESEIM.Models
{
    [Table("RM_APPOINTMENT_JOB_EMPLOYEE")]
    public class RmAppointmentJobEmployee
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(maximumLength: 250)]
        public string AppointName { get; set; }

        [StringLength(maximumLength: 250)]
        public string Description { get; set; }

        public DateTime? AppointStart { get; set; }
        public DateTime? AppointEnd { get; set; }
      
        public int? EmployeeId { get; set; }
        public DateTime? CreatedTime { get; set; }
        public DateTime? UpdatedTime { get; set; }

        public int? flag { get; set; }

        [StringLength(maximumLength: 250)]
        public string CreatedBy { get; set; }

        [StringLength(maximumLength: 250)]
        public string UpdatedBy { get; set; }
    }
}
