using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("HISTORY_SPECIALIST")]
    public class HistorySpecialist
    {
        [Key]
        public int Id { get; set; } 
        public DateTime? MonthYear { get; set; }
        public string   Reason { get; set; }
        public string GrantOfDecision { get; set; }
		public string ProfileCode { get; set; }
        public bool IsDeleted {  get; set; }
	}
}
