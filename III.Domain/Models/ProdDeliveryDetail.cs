using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace ESEIM.Models
{
    [Table("PROD_DELIVERY_DETAIL")]
    public class ProdDeliveryDetail
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(255)]
        public string TicketCode { get; set; }

        [StringLength(255)]
        public string LotProductCode { get; set; }

        [StringLength(100)]
        public string ProductCode { get; set; }

        [StringLength(50)]
        public string ProductType { get; set; }

        [StringLength(255)]
        public string ProductQrCode { get; set; }

        public decimal Quantity { get; set; }

        [StringLength(50)]
        public string Unit { get; set; }

        public decimal? SalePrice { get; set; }

        [StringLength(50)]
        public string Currency { get; set; }

        public int? TaxRate { get; set; }

        public int? Discount { get; set; }

        public int? Commission { get; set; }

        [StringLength(50)]
        public string CreatedBy { get; set; }

        public DateTime CreatedTime { get; set; }

        [StringLength(50)]
        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }

        [StringLength(50)]
        public string DeletedBy { get; set; }

        public DateTime? DeletedTime { get; set; }

        public bool IsDeleted { get; set; }

        public bool MarkWholeProduct { get; set; }

        [StringLength(255)]
        public string RackCode { get; set; }

        [StringLength(255)]
        public string ProductCoil { get; set; }
        public int MapId { get; set; }
        public string PackCode { get; set; }
        public string ProdCustomJson { get; set; }
        public bool? IsCustomized { get; set; }
        public bool? IsInside { get; set; }
        public string InsideOriginMap { get; set; }
        public string InsideOriginNo { get; set; }
        public string ProdParent { get; set; }
        public string ExportDetailGroup { get; set; }
    }

    public class ProdDeliveryDetailExport
    {
        public int No { get; set; }
        public string ProductName { get; set; }
        public string ProductCode { get; set; }
        public string Unit { get; set; }
        public decimal QuantityPO { get; set; }
        public decimal Quantity { get; set; }
        public decimal? SalePrice { get; set; }
        public decimal TotalAmount { get; set; }
    }
}
