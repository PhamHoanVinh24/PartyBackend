using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("CUSTOMER_APPOINTMENT")]
    public class CustomerAppointment
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public string CustomerCode { get; set; }

        //[StringLength(100)]
        //public int? ProjectVersion { get; set; }

        [StringLength(500)]
        public string Note { get; set; }

        [StringLength(255)]
        public string Title { get; set; }

        [StringLength(50)]
        public string Tags { get; set; }

        public DateTime? FromDate { get; set; }

        public DateTime? ToDate { get; set; }

        [StringLength(255)]
        public string Location { get; set; }

        [StringLength(255)]
        public string RepeatType { get; set; }
				
        [StringLength(50)]
        public string CreatedBy { get; set; }

        public DateTime? CreatedTime { get; set; }
        [StringLength(50)]
        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }

        [StringLength(50)]
        public string DeletedBy { get; set; }

        public DateTime? DeletedTime { get; set; }

        public bool IsDeleted { get; set; }
    }
}
