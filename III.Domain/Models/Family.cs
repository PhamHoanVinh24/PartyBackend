using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
	[Table("FAMILY")]
	public class Family
	{
		[Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
		public int Id { get; set; }

		[StringLength(maximumLength: 200)]
		public string PoliticalAttitude { get; set; }

		
		public string Relation { get; set; }

		
		public string ClassComposition { get; set; }

		public bool PartyMember { get; set; }

		
		public string BirthYear { get; set; }

	
		public string DeathYear { get; set; }

		
		public string DeathReason { get; set; }

	
		public string HomeTown { get; set; }

	
		public string Residence { get; set; }

	
		public string Job { get; set; }

	
		public string WorkingProgress { get; set; }


		public string Name { get; set; }

		public string ProfileCode { get; set; }
		public bool IsDeleted {  get; set; }
	}
}
