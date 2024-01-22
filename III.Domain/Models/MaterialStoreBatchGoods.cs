using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace ESEIM.Models
{
    [Table("MATERIAL_STORE_BATCH_GOODS")]
    public class MaterialStoreBatchGoods
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(250)]
        public string Name { get; set; }

        public DateTime? DateReiceive { get; set; }

        public DateTime? DateProduce { get; set; }

        public DateTime? DateExpire { get; set; }

        public int? Quantity { get; set; }

        public int? SupplierId { get; set; }

        [StringLength(250)]
        public string Unit { get; set; }

        public int? StoreId { get; set; }

        [StringLength(20)]
        public string Barcode { get; set; }

        [StringLength(100)]
        public string ProductCode { get; set; }

        [StringLength(100)]
        public string BlockCode { get; set; }

        [StringLength(50)]
        public string Code { get; set; }

        [StringLength(100)]
        public string Madein { get; set; }

        [StringLength(500)]
        public string Description { get; set; }

        [StringLength(500)]
        public string Packing { get; set; }

        public double? Cost { get; set; }

        public int? Sale { get; set; }

        [StringLength(100)]
        public string Currency { get; set; }

        public int? Vat { get; set; }

        public double? Total { get; set; }

        [StringLength(50)]
        public string CreatedBy { get; set; }

        [StringLength(50)]
        public string UpdatedBy { get; set; }

        public DateTime? CreatedTime { get; set; }

        public DateTime? UpdatedTime { get; set; }

        [StringLength(50)]
        public string DeletedBy { get; set; }

        public DateTime? DeletedTime { get; set; }

        public bool IsDeleted { get; set; }
    }
}
