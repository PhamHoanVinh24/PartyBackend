using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("VC_PRODUCT_CAT")]
    public class VcProductCat
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(100)]
        public string ProductCode { get; set; }

        [StringLength(255)]
        public string ProductName { get; set; }

        [StringLength(50)]
        public string Unit { get; set; }

        [StringLength(500)]
        public string PathImg { get; set; }

        [StringLength(500)]
        public string Note { get; set; }

        [StringLength(100)]
        public string ProductGroup { get; set; }

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

        [StringLength(500)]
        public string PathFile { get; set; }

        [StringLength(250)]
        public string FileName { get; set; }
    }
}
