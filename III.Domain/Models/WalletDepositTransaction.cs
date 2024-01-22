using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ESEIM.Models
{
    [Table("WALLET_DEPOSIT_TRANSACTION")]
    public class WalletDepositTransaction
    {
        public WalletDepositTransaction()
        {
        }
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ID { get; set; }
        [StringLength(255)]
        public string TransactionCode { get; set; }
        [StringLength(255)]
        public string TransactionType { get; set; }
        public string Type { get; set; }
        public decimal Amount { get; set; }
        [StringLength(255)]
        public string Currency { get; set; }
        [StringLength(255)]
        public string TransactionLog { get; set; }
        [StringLength(255)]
        public string Status { get; set; }
        public bool? IsDeleted { get; set; }
        public decimal Coin { get; set; }
        public DateTime? CreatedTime { get; set; }
        public string CreatedBy { get; set; }
    }
    public class PaypalTransactionHistory
    {
        public int Id { get; set; }
        [StringLength(255)]
        public string TxnId { get; set; }
        [StringLength(255)]
        public string PaymentStatus { get; set; }
        [StringLength(255)]
        public string PayerEmail { get; set; }
        public string PaymentType { get; set; }
        public decimal PaymentAmount { get; set; }
        public string PaymentCurrency { get; set; }
        public decimal PaymentQuantity { get; set; }
        public string PaymentLog { get; set; }
        public DateTime? PaymentDate { get; set; }
        [StringLength(50)]
        public string CreatedBy { get; set; }
        public string ItemCode { get; set; }
        public string ItemType { get; set; }
    }
}