using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("PROD_PACKAGE_RECEIVED")]
    public class ProdPackageReceived
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(255)]
        public string CoilCode { get; set; }
        [NotMapped]
        public string ProductCoil { get; set; }
        [NotMapped]
        public string ProductCoilRelative { get; set; }

        [StringLength(255)]
        public decimal? Size { get; set; }

        [StringLength(255)]
        public decimal? Remain { get; set; }

        [StringLength(255)]
        public string PositionInStore { get; set; }
        [NotMapped]
        public string LineCode { get; set; }

        [StringLength(255)]
        public string RackCode { get; set; }

        [StringLength(255)]
        public string RackPosition { get; set; }

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
        public string TicketCode { get; set; }
        public string CoilRelative { get; set; }
        public string PackType { get; set; }
        public string ProductQrCode { get; set; }
        public string ProductImpType { get; set; }
        public string UnitCoil { get; set; }
        public string ProductLot { get; set; }
        [NotMapped]
        public string StoreCode { get; set; }
        [StringLength(100)]
        public string ProductCode { get; set; }
        [StringLength(50)]
        public string ProductType { get; set; }

        [NotMapped]
        public decimal Quantity { get; set; }
    }

    public class ProdPackageInfoCustom
    {
        public string CoilCode { get; set; }
        public string ProductQrCode { get; set; }
        [NotMapped]
        public string LineCode { get; set; }
        public string RackCode { get; set; }
        public string RackPosition { get; set; }
        public string PositionInStore { get; set; }
        public decimal? Size { get; set; }
    }
}
