import { Component, OnInit } from '@angular/core';
import { PokemonBasic, PokemonFull, PokemonService, User } from '../auth/pokemon.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  pokemons: PokemonBasic[] = [];
  displayed: PokemonBasic[] = [];
  searchText = '';
  
  // Variables para modales
  showAddModal = false;
  showEditModal = false;
  showDetailModal = false;
  showProfileModal = false;
  isLoadingDetails = false;
  
  // Variables para usuario
  currentUser: User | null = null;
  showProfileDropdown = false;
  
  newPokemon: any = {
    name: '',
    types: '',
    weight: 0,
    image: ''
  };
  
  editingPokemon: any = {
    id: 0,
    name: '',
    types: '',
    weight: 0,
    image: ''
  };
  
  selectedPokemon: PokemonFull | null = null;

  constructor(private pokemonService: PokemonService, private router: Router) {}

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadPokemons();
  }

  loadCurrentUser(): void {
    this.pokemonService.getCurrentUser().subscribe({
      next: (user) => {
        this.currentUser = user;
      },
      error: (err) => {
        console.error('Error loading user:', err);
      }
    });
  }

  loadPokemons(): void {
    this.pokemonService.getPokemonsBasic().subscribe({
      next: (data) => {
        this.pokemons = this.displayed = data;
      },
      error: (err) => {
        console.error('Error loading pokemons:', err);
      }
    });
  }

  openAddModal(): void {
    this.showAddModal = true;
    this.newPokemon = {
      name: '',
      types: '',
      weight: 0,
      image: ''
    };
  }

  openEditModal(pokemon: PokemonBasic): void {
    this.showEditModal = true;
    this.editingPokemon = {
      id: pokemon.id,
      name: pokemon.name,
      types: pokemon.types.join(', '),
      weight: pokemon.weight,
      image: pokemon.image
    };
  }

  openDetailModal(pokemon: PokemonBasic): void {
    this.isLoadingDetails = true;
    this.showDetailModal = true;
    
    this.pokemonService.getPokemonDetails(pokemon.id).subscribe({
      next: (fullData) => {
        this.selectedPokemon = fullData;
        this.isLoadingDetails = false;
      },
      error: (err) => {
        console.error('Error loading pokemon details:', err);
        this.isLoadingDetails = false;
      }
    });
  }

  closeModal(): void {
    this.showAddModal = false;
    this.showEditModal = false;
    this.showDetailModal = false;
    this.showProfileModal = false;
    this.selectedPokemon = null;
  }
  toggleProfileDropdown(): void {
    this.showProfileDropdown = !this.showProfileDropdown;
  }

  showProfileInfo(): void {
    this.showProfileModal = true;
    this.showProfileDropdown = false;
  }
  logout(): void {
    localStorage.removeItem('authToken');
    this.router.navigate(['/login']);
  }

  filter(): void {
    const q = this.searchText.toLowerCase();
    this.displayed = this.pokemons.filter(p =>
      p.name.toLowerCase().includes(q) || 
      p.types.some(t => t.toLowerCase().includes(q))
    );
  }

  delete(pokemon: PokemonBasic): void {
    if (confirm(`¿Estás seguro de eliminar a ${pokemon.name}?`)) {
      this.pokemons = this.pokemons.filter(p => p.id !== pokemon.id);
      this.filter();
    }
  }

  saveEdit(): void {
    const index = this.pokemons.findIndex(p => p.id === this.editingPokemon.id);
    if (index !== -1) {
      this.pokemons[index] = {
        id: this.editingPokemon.id,
        name: this.editingPokemon.name,
        types: this.editingPokemon.types.split(',').map((t: string) => t.trim()),
        weight: this.editingPokemon.weight,
        image: this.editingPokemon.image
      };
      this.filter();
      this.closeModal();
    }
  }

  addPokemon(): void {
    if (this.newPokemon.name && this.newPokemon.types && this.newPokemon.image) {
      const newPokemon: PokemonBasic = {
        id: this.pokemons.length > 0 ? Math.max(...this.pokemons.map(p => p.id)) + 1 : 1,
        name: this.newPokemon.name,
        types: this.newPokemon.types.split(',').map((t: string) => t.trim()),
        weight: this.newPokemon.weight,
        image: this.newPokemon.image
      };
      this.pokemons.push(newPokemon);
      this.filter();
      this.closeModal();
    }
  }
}