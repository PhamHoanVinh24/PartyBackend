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
        public string MonthYear { get; set; }
        public string   Content { get; set; }
       
		public string ProfileCode { get; set; }
        public bool IsDeleted {  get; set; }
	}
}
