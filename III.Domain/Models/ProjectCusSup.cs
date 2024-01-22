using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("PROJECT_CUS_SUP")]
    public class ProjectCusSup
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(100)]
        public string ObjCode { get; set; }

        [StringLength(50)]
        public string ObjType { get; set; }

        [StringLength(250)]
        public string Role { get; set; }

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

        [StringLength(255)]
        public string ProjectCode { get; set; }

        public bool IsMain { get; set; }
    }
}
