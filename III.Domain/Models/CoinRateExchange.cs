using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("COIN_RATE_EXCHANGE")]
    public class CoinRateExchange
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(100)]
        public string Money { get; set; }

        [StringLength(255)]
        public string Currency { get; set; }

        public decimal? Rate { get; set; }

        public DateTime? TimeUpdated { get; set; }

    }
}
