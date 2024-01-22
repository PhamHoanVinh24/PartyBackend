using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace III.Domain.Models
{
    [Table("SW_MODULE_RESOURCE")]
    public class SwModuleResource
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(50)]
        public string ModuleCode { get; set; }

        [StringLength(50)]
        public string ModuleTitle { get; set; }

        [StringLength(500)]
        public string Description { get; set; }

        public int Level { get; set; }

        [StringLength(255)]
        public string ParentModule { get; set; }

        public DateTime CreatedTime { get; set; }

        [StringLength(50)]
        public string CreatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }

        [StringLength(50)]
        public string UpdatedBy { get; set; }
    }
}
