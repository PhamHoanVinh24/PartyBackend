using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("LOT_PRODUCT")]
    public class LotProduct
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(255)]
        public string QrCode { get; set; }
        public string LotProductCode { get; set; }

        [StringLength(255)]
        public string BarCode { get; set; }

        [StringLength(50)]
        public string Title { get; set; }

        public string Supplier { get; set; }
        public DateTime? ExpiryDate { get; set; }
        [NotMapped]
        public string sExpiryDate { get; set; }
        [NotMapped]
        public string sManufactureDate { get; set; }

        public decimal Cost { get; set; }
        public string Unit { get; set; }
        public string PathImg { get; set; }
        public string Packing { get; set; }
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

        public decimal Tax { get; set; }
        public decimal CustomFee { get; set; }
        public decimal PoundAge { get; set; }
        public decimal TransferCost { get; set; }
        public decimal Discount { get; set; }
        public string Note { get; set; }
        public string LotProductName { get; set; }
        public int Store { get; set; }
        public string Origin { get; set; }
        public DateTime? ManufactureDate { get; set; }
        [NotMapped]
        public List<LotFile> LotFile { get; set; }

        [StringLength(50)]
        public string Currency { get; set; }
        public decimal? TaxMedium { get; set; }
        public decimal? CostMedium { get; set; }
    }

    public class LotFile
    {
        public int Id { get; set; }
        public string FileCode { get; set; }
        public string FileName { get; set; }
        public string FilePath { get; set; }
        public string FileType { get; set; }
        public string Status { get; set; }
        public string ContentType { get; set; }
    }
}
