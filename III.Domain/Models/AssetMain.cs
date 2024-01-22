using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("ASSET_MAIN")]
    public class AssetMain
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int AssetID { get; set; }

        [StringLength(100)]
        public string AssetCode { get; set; }

        [StringLength(255)]
        public string AssetName { get; set; }

        [StringLength(255)]
        public string AssetType { get; set; }

        [StringLength(255)]
        public string AssetGroup { get; set; }

        [StringLength(255)]
        public string Description { get; set; }

        [StringLength(255)]
        public string PathIMG { get; set; }

        [StringLength(100)]
        public string Status { get; set; }

        public DateTime? BuyedTime { get; set; }

        [NotMapped]
        public string sBuyedTime { get; set; }

        public DateTime? ExpiredDate { get; set; }

        [NotMapped]
        public string sExpiredDate { get; set; }

        public decimal? Cost { get; set; }

        [StringLength(255)]
        public string Currency { get; set; }

        [StringLength(50)]
        public string SupplierCode { get; set; }

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
        public string LocationText { get; set; }

        [StringLength(255)]
        public string LocationGps { get; set; }

        [StringLength(255)]
        public string LocationSet { get; set; }

        [StringLength(255)]
        public string Branch { get; set; }

        [StringLength(255)]
        public string Department { get; set; }

        [StringLength(255)]
        public string UserResponsible { get; set; }

        [StringLength(255)]
        public string OrderNo { get; set; }

        [NotMapped]
        public int? QuantityTotal { get; set; }
    }
}
