using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("WARNING_DISCIPLINED")]
    public class WarningDisciplined
    {
		[Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
		public int Id { get; set; }

		public DateTime MonthYear { get; set; }

        [MaxLength(200)]
        public string Reason { get; set; }

        [MaxLength(50)]
        public string GrantOfDecision { get; set; }
		public string ProfileCode { get; set; }
        public bool IsDeleted {  get; set; }
	}
}
