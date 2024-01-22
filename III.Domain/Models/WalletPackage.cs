using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("WALLET_PACKAGE")]
    public class WalletPackage
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(255)]
        public string PackageCode { get; set; }
        [StringLength(255)]
        public string PackageName { get; set; }
        public string Description { get; set; }
        [StringLength(255)]
        public string Status { get; set; }
        public string ConditionJson { get; set; }

        public decimal Duration { get; set; }
        [StringLength(255)]
        public string DurationUnit { get; set; }

        [StringLength(50)]
        public string CreatedBy { get; set; }

        public DateTime? CreatedTime { get; set; }

        [StringLength(50)]
        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }

        public bool IsDeleted { get; set; }

        [StringLength(50)]
        public string DeletedBy { get; set; }

        public DateTime? DeletedTime { get; set; }
    }
}
