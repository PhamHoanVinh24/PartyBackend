using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("PRODUCT_ENTITY_MAPPING_LOG")]
    public class ProductEntityMappingLog
    { 
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(255)]
        public string WHS_Code { get; set; }

        [StringLength(255)]
        public string FloorCode { get; set; }

        [StringLength(255)]
        public string LineCode { get; set; }

        [StringLength(255)]
        public string RackCode { get; set; }

        [StringLength(255)]
        public string RackPosition { get; set; }

        [StringLength(255)]
        public string Ordering { get; set; }

        [StringLength(255)]
        public string ProductQrCode { get; set; }

        public bool IsDeleted { get; set; }

        public decimal? Quantity { get; set; }
        [StringLength(50)]
        public string Unit { get; set; }

        [StringLength(maximumLength: 50)]
        public string CreatedBy { get; set; }

        public DateTime? CreatedTime { get; set; }

        [StringLength(maximumLength: 50)]
        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }

    }
}
