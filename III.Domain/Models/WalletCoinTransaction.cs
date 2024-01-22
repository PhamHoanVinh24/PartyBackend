using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("WALLET_COIN_TRANSACTION")]
    public class WalletCoinTransaction
    {
        public int Draw;

        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        [StringLength(255)]
        public string TransactionCode { get; set; }
        [StringLength(255)]
        public decimal Coin { get; set; }
        [StringLength(255)]
        public string ItemCode { get; set; }
        [StringLength(255)]
        public string ItemType { get; set; }
        public string TransactionCoinLog { get; set; }
        [StringLength(255)]
        public string Status { get; set; }
        [StringLength(50)]
        public string Buyer { get; set; }
        public string Seller { get; set; }

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
        public string TransactionType { get; set; }
        public string Type { get; set; }
        public decimal? Amount { get; set; }
        public string Currency { get; set; }
    }
}
