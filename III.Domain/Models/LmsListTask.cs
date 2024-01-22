using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("LMS_LIST_TASK")]
    public class LmsListTask
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ListID { get; set; }

        [Key, StringLength(100)]
        public string ListCode { get; set; }

        [StringLength(255)]
        public string ListName { get; set; }

        [StringLength(100)]
        public string BoardCode { get; set; }

        public int Order { get; set; }

        [StringLength(255)]
        public string Avatar { get; set; }

        public int? Status { get; set; }

        [StringLength(255)]
        public string Background { get; set; }

        [Column(TypeName = "decimal(14,2)")]
        public decimal Completed { get; set; }

        public DateTime? CompletedTime { get; set; }

        public decimal? Cost { get; set; }

        public DateTime Deadline { get; set; }

        [StringLength(255)]
        public string LocationText { get; set; }

        [StringLength(255)]
        public string LocationGps { get; set; }

        [StringLength(255)]
        public string Device { get; set; }

        public DateTime BeginTime { get; set; }

        [Column(TypeName = "decimal(14,2)")]
        public decimal WeightNum { get; set; }

        public DateTime CreatedDate { get; set; }

        [StringLength(50)]
        public string CreatedBy { get; set; }

        public bool IsDeleted { get; set; }
    }
}
