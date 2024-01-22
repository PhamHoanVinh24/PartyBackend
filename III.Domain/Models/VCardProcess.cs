using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("V_CARD_PROCESS")]
    public class VCardProcess
    {
        [Key]
        public Guid Id { get; set; }
        public string CardCode { get; set; }
        public decimal? WeightNum { get; set; }
        public int? Month { get; set; }
        public int? Year { get; set; }
        public decimal? Progress { get; set; }
        public string BoardCode { get; set; }
        public string ObjId { get; set; }
    }
}
