using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("MATERIAL_STORE")]
    public class MaterialStore
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int StoreId { get; set; }

        [StringLength(100)]
        public string StoreCode { get; set; }

        [StringLength(250)]
        public string StoreName { get; set; }

        [StringLength(500)]
        public string Description { get; set; }

        public int? Flag { get; set; }

        [StringLength(250)]
        public string Location { get; set; }

        [StringLength(255)]
        public string UserId { get; set; }
        [NotMapped]
        public string UserName { get; set; }

        public int? Province { get; set; }

        public int? District { get; set; }

        public int? Ward { get; set; }

        public int? BranchId { get; set; }

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
        public string Area { get; set; }
        public string Status { get; set; }
        public string Extend { get; set; }
        public string Type { get; set; }
        public int CountFloor { get; set; }

    }
}
