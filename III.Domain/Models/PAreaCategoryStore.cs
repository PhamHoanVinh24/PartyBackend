using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("P_AREA_CATEGORY_STORE")]
    public class PAreaCategoryStore : IHaveParent
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        [Column("P_AREA_CODE")]
        public string PAreaCode { get; set; }
        [Column("P_AREA_DESCRIPTION")]
        public string PAreaDescription { get; set; }
        [Column("P_AREA_PARENT")]
        public string PAreaParent { get; set; }
        [Column("P_AREA_TYPE")]
        public string PAreaType { get; set; }
        public string Note {  get; set; }

        [StringLength(100)]
        public string CreatedBy { get; set; }

        public DateTime? CreatedTime { get; set; }

        [StringLength(100)]
        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }

        [StringLength(100)]
        public string DeletedBy { get; set; }

        public DateTime? DeletedTime { get; set; }

        public bool? IsDeleted { get; set; }
        [NotMapped]
        public string Code {
            get => PAreaCode;
            set => PAreaCode = value;
        }
        [NotMapped]
        public string Parent {
            get => PAreaParent;
            set => PAreaParent = value;
        }
    }
}
