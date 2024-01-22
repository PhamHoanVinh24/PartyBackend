using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("LMS_BOARD_TASK")]
    public class LmsBoardTask
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int BoardID { get; set; }

        [StringLength(100)]
        public string BoardCode { get; set; }

        [StringLength(255)]
        public string BoardName { get; set; }

        [StringLength(255)]
        public string TeamCode { get; set; }

        [StringLength(255)]
        public string Avatar { get; set; }

        [StringLength(255)]
        public string Visibility { get; set; }

        [StringLength(255)]
        public string BackgroundColor { get; set; }

        [StringLength(255)]
        public string BackgroundImage { get; set; }

        [StringLength(50)]
        public string BoardType { get; set; }

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

        [StringLength(50)]
        public string UpdateBy { get; set; }
        public string Branch { get; set; }
        public string Department { get; set; }
        public bool IsDeleted { get; set; }

        [NotMapped]
        public string BeginTimeView { get; set; }

        [NotMapped]
        public string DeadLineView { get; set; }

        [NotMapped]
        public string TeamName { get; set; }
    
    }
}
