using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Newtonsoft.Json;

namespace ESEIM.Models
{
    [Table("WALLET_TABLE_COST_ITEM")]
    public class WalletTableCostItem
    {
        public WalletTableCostItem()
        {
            ListLogs = new List<LogCost>();
        }
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(255)]
        public string ItemType { get; set; }
        [StringLength(255)]
        public string ItemCode { get; set; }

        public decimal Coin { get; set; }
        public string LogCostHistory
        {
            get => JsonConvert.SerializeObject(ListLogs);
            set =>
                ListLogs = string.IsNullOrEmpty(value)
                    ? new List<LogCost>()
                    : JsonConvert.DeserializeObject<List<LogCost>>(value);
        }
        [NotMapped]
        public List<LogCost> ListLogs { get; set; }

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

    public class LogCost
    {
        public decimal OldValue { get; set; }
        public decimal NewValue { get; set; }
        public DateTime TimeStamp { get; set; }
    }
}
